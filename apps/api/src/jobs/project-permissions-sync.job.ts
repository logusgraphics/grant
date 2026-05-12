import type { ProjectPermissionsSyncJobExecutionData } from '@grantjs/core';
import { ConflictError } from '@grantjs/core';
import {
  CdmFindBy,
  ProjectPermissionsSyncJobStatus,
  type Scope,
  type SyncProjectPermissionsInput,
  type SyncProjectPermissionsResult,
} from '@grantjs/schema';

import {
  assertTenantActive,
  type JobExecutionContext,
  type JobResult,
  type ScheduledJob,
  validateTenantJobContext,
} from '@/lib/jobs';
import { Job } from '@/lib/jobs/base/job';
import { scopeToRlsContext, setRlsContext } from '@/lib/rls';
import { DrizzleTransactionalConnection, type Transaction } from '@/lib/transaction-manager.lib';

/**
 * Async worker for CDM permission sync. The handler in `ProjectHandler.startProjectPermissionsSync`
 * persists a job tracking row and enqueues this worker with `{ scope, payload: { jobRecordId } }`.
 *
 * Flow:
 *   1. Validate tenant scope from the enqueue context.
 *   2. Load the persisted payload + scope from the tracking row (worker-only `loadForExecution`).
 *   3. Transition to RUNNING (raises ConflictError if the row is already non-pending).
 *   4. Run `syncProjectPermissions` inside a Drizzle transaction.
 *   5. On success: mark COMPLETED and invalidate scope/user caches.
 *   6. On failure: mark FAILED and rethrow so the queue applies retry/backoff policy.
 *
 * Every query touching `project_permission_sync_jobs` (and project-scoped sync data)
 * runs inside a transaction after {@link setRlsContext} for the enqueue scope.
 * Otherwise pooled connections without `app.current_project_id` set correctly can hit
 * RLS on `project_permission_sync_jobs` and return no row (`ProjectPermissionsSyncJob not found`)
 * even when the job exists.
 */
export default class ProjectPermissionsSyncJob extends Job {
  readonly config: ScheduledJob = {
    id: 'project-permissions-sync',
    schedule: '',
    enabled: true,
    enqueueOnly: true,
  };

  async execute(context: JobExecutionContext): Promise<JobResult> {
    validateTenantJobContext(context, true);
    const enqueueScope = context.scope as Scope;
    await assertTenantActive(enqueueScope, this.appContext.db);

    const jobRecordId = this.extractJobRecordId(context.payload);

    const {
      projectPermissionsSyncJobs: jobService,
      projectPermissionSync,
      projectPermissionExport,
    } = this.appContext.services;

    const execData = await this.withEnqueueScopeRls(enqueueScope, (tx) =>
      jobService.loadForExecution({ jobId: jobRecordId }, tx)
    );
    this.assertScopesMatch(enqueueScope, execData.scope);

    if (
      execData.cancelRequested ||
      execData.job.status === ProjectPermissionsSyncJobStatus.Cancelled
    ) {
      this.logger.info({
        jobRecordId,
        msg: 'Skipping permission sync because the job was cancelled before execution',
      });
      return {
        success: true,
        message: 'Cancelled before execution',
      };
    }

    if (execData.job.status !== ProjectPermissionsSyncJobStatus.Pending) {
      throw new ConflictError(
        `Cannot execute project-permissions-sync job ${jobRecordId} from status ${execData.job.status}`
      );
    }

    await this.withEnqueueScopeRls(enqueueScope, (tx) =>
      jobService.transitionToRunning({ jobId: jobRecordId }, tx)
    );

    let result: SyncProjectPermissionsResult;
    try {
      const txConn = new DrizzleTransactionalConnection(this.appContext.db);
      result = await txConn.withTransaction(async (tx: Transaction) => {
        await setRlsContext(tx, scopeToRlsContext(execData.scope));

        /**
         * Capture a pre-sync rollback snapshot inside the same transaction
         * as the import, BEFORE we call into the sync service (which begins
         * with `teardownCdmEntities` and immediately mutates project state).
         *
         * Why inside the transaction: the snapshot must commit if and only
         * if the import commits. If `syncProjectPermissions` throws, the
         * whole transaction rolls back — including the snapshot write — so
         * a `failed` job ends with `snapshot IS NULL`, which correctly
         * reflects the unchanged project state on the rolled-back side.
         *
         * The export service iterates the same `ICdmEntityHandler[]`
         * registry as the sync service, so the snapshot's shape exactly
         * matches what `syncProjectPermissions` accepts as input — making
         * a future "rollback" action a one-line resubmit of the snapshot.
         */
        const takenAt = new Date();
        const snapshot = await projectPermissionExport.exportProjectPermissions(
          {
            projectId: execData.job.projectId,
            scope: execData.scope,
            version: execData.payload.version,
          },
          tx
        );
        await jobService.saveSnapshot({ jobId: jobRecordId, snapshot, takenAt }, tx);
        return projectPermissionSync.syncProjectPermissions(
          {
            projectId: execData.job.projectId,
            scope: execData.scope,
            input: execData.payload,
          },
          tx
        );
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const details = this.serializeErrorDetails(error);
      try {
        await this.withEnqueueScopeRls(enqueueScope, (tx) =>
          jobService.markFailed(
            {
              jobId: jobRecordId,
              errorMessage: message,
              errorDetails: details,
            },
            tx
          )
        );
      } catch (markErr) {
        this.logger.error({
          jobRecordId,
          err: markErr,
          msg: 'Failed to mark project-permissions-sync job as failed; original error will still be rethrown',
        });
      }
      throw error;
    }

    const warnings = Array.isArray(result.warnings) ? result.warnings.filter(Boolean) : [];
    await this.withEnqueueScopeRls(enqueueScope, (tx) =>
      jobService.markCompleted(
        {
          jobId: jobRecordId,
          result,
          warnings,
        },
        tx
      )
    );

    const userIds = this.collectUserIds(execData);
    try {
      await projectPermissionSync.invalidateCachesForSyncResult({
        scope: execData.scope,
        userIds,
      });
    } catch (cacheErr) {
      this.logger.warn({
        jobRecordId,
        err: cacheErr,
        msg: 'Permission sync committed but cache invalidation failed; clients may serve stale data until TTL',
      });
    }

    return {
      success: true,
      data: {
        jobRecordId,
        projectId: execData.job.projectId,
        rolesCreated: result.rolesCreated,
        groupsCreated: result.groupsCreated,
        userRolesAssigned: result.userRolesAssigned,
        warnings: warnings.length,
      },
    };
  }

  /**
   * Apply the same RLS session variables as a scoped HTTP request for this job's tenant,
   * so worker queries see project-scoped rows (see `project_permission_sync_jobs` policies).
   */
  private async withEnqueueScopeRls<T>(
    scope: Scope,
    fn: (tx: Transaction) => Promise<T>
  ): Promise<T> {
    return this.appContext.db.transaction(async (tx) => {
      await setRlsContext(tx, scopeToRlsContext(scope));
      return fn(tx);
    });
  }

  private extractJobRecordId(payload: unknown): string {
    if (
      payload == null ||
      typeof payload !== 'object' ||
      !('jobRecordId' in payload) ||
      typeof (payload as { jobRecordId: unknown }).jobRecordId !== 'string' ||
      (payload as { jobRecordId: string }).jobRecordId.trim() === ''
    ) {
      throw new Error(
        'project-permissions-sync job payload must include a non-empty jobRecordId string'
      );
    }
    return (payload as { jobRecordId: string }).jobRecordId;
  }

  private assertScopesMatch(enqueueScope: Scope, persistedScope: Scope): void {
    if (enqueueScope.tenant !== persistedScope.tenant || enqueueScope.id !== persistedScope.id) {
      throw new Error(
        `project-permissions-sync scope mismatch: enqueue=${enqueueScope.tenant}:${enqueueScope.id} persisted=${persistedScope.tenant}:${persistedScope.id}`
      );
    }
  }

  private collectUserIds(execData: ProjectPermissionsSyncJobExecutionData): string[] {
    const ids = new Set<string>();
    const payload = execData.payload as SyncProjectPermissionsInput;
    for (const u of payload.users ?? []) {
      if (u.key.findBy === CdmFindBy.Id) {
        ids.add(u.key.value);
      }
    }
    return Array.from(ids);
  }

  private serializeErrorDetails(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    return { value: String(error) };
  }
}
