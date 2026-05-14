import type {
  IAuditLogger,
  IProjectSyncJobService,
  ProjectSyncJobExecutionData,
} from '@grantjs/core';
import {
  ProjectSyncJob,
  ProjectSyncJobPage,
  ProjectSyncJobSortInput,
  ProjectSyncJobStatus,
  Scope,
  SyncProjectInput,
  SyncProjectResult,
  Tenant,
} from '@grantjs/schema';

import { BadRequestError, ConflictError, NotFoundError, ValidationError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';
import { ProjectSyncJobRepository } from '@/repositories/project-sync-job.repository';

const ALLOWED_SCOPES: readonly string[] = [Tenant.AccountProject, Tenant.OrganizationProject];

/** Compact job fields for audit rows (varchar limits); never store full CDM payload. */
function compactJobSummary(job: ProjectSyncJob): Record<string, unknown> {
  return {
    status: job.status,
    projectId: job.projectId,
    cdmVersion: job.cdmVersion,
    importId: job.importId,
  };
}

function compactResultSummary(result: SyncProjectResult): Record<string, unknown> {
  return {
    rolesCreated: result.rolesCreated,
    groupsCreated: result.groupsCreated,
    roleGroupsLinked: result.roleGroupsLinked,
    groupPermissionsLinked: result.groupPermissionsLinked,
    projectRolesLinked: result.projectRolesLinked,
    projectGroupsLinked: result.projectGroupsLinked,
    projectPermissionsLinked: result.projectPermissionsLinked,
    projectResourcesLinked: result.projectResourcesLinked,
    projectUsersEnsured: result.projectUsersEnsured,
    usersCreated: result.usersCreated,
    userRolesAssigned: result.userRolesAssigned,
    projectUserApiKeysCreated: result.projectUserApiKeysCreated,
    warningsCount: Array.isArray(result.warnings) ? result.warnings.length : 0,
  };
}

/**
 * State-machine service for the asynchronous CDM permission sync job tracking
 * row. Owns persistence + lifecycle transitions only; the actual import is
 * performed by `IProjectSyncService` (called by the worker).
 *
 * Allowed transitions:
 *   pending   -> running | cancelled
 *   running   -> completed | failed | cancelled
 *   (terminal: completed, failed, cancelled)
 */
export class ProjectSyncJobService implements IProjectSyncJobService {
  constructor(
    private readonly repo: ProjectSyncJobRepository,
    private readonly audit: IAuditLogger
  ) {}

  public async create(
    params: {
      projectId: string;
      scope: Scope;
      cdmVersion: number;
      importId: string | null;
      payload: SyncProjectInput;
      enqueuedById: string;
    },
    transaction?: Transaction
  ): Promise<ProjectSyncJob> {
    if (!ALLOWED_SCOPES.includes(params.scope.tenant)) {
      throw new BadRequestError(
        `Project permissions sync requires accountProject or organizationProject scope, got: ${params.scope.tenant}`
      );
    }
    if (params.cdmVersion !== 1) {
      throw new ValidationError('Unsupported cdmVersion; only 1 is allowed');
    }

    const job = await this.repo.insert(
      {
        projectId: params.projectId,
        scopeTenant: params.scope.tenant,
        scopeId: params.scope.id,
        cdmVersion: params.cdmVersion,
        importId: params.importId,
        payload: params.payload,
        enqueuedById: params.enqueuedById,
      },
      transaction
    );
    await this.audit.logCreate(
      job.id,
      compactJobSummary(job),
      { projectId: params.projectId },
      transaction
    );
    return job;
  }

  public async getById(
    params: { projectId: string; jobId: string },
    transaction?: Transaction
  ): Promise<ProjectSyncJob> {
    const row = await this.repo.getById(params.jobId, transaction);
    if (!row || row.projectId !== params.projectId) {
      throw new NotFoundError('ProjectSyncJob', params.jobId);
    }
    return row;
  }

  public async list(
    params: {
      projectId: string;
      scope: Scope;
      page?: number | null;
      limit?: number | null;
      search?: string | null;
      sort?: ProjectSyncJobSortInput | null;
      status?: ProjectSyncJobStatus | null;
    },
    transaction?: Transaction
  ): Promise<ProjectSyncJobPage> {
    if (!ALLOWED_SCOPES.includes(params.scope.tenant)) {
      throw new BadRequestError(
        `Project permissions sync requires accountProject or organizationProject scope, got: ${params.scope.tenant}`
      );
    }

    const page = Math.max(1, params.page ?? 1);
    const requestedLimit = params.limit ?? 50;
    const limit = requestedLimit < 0 ? 0 : Math.min(requestedLimit, 200);

    const { items, totalCount } = await this.repo.listByProject(
      {
        projectId: params.projectId,
        scopeTenant: params.scope.tenant,
        scopeId: params.scope.id,
        page,
        limit,
        search: params.search ?? null,
        sort: params.sort ?? null,
        status: params.status ?? null,
      },
      transaction
    );

    const hasNextPage = limit > 0 ? totalCount > page * limit : false;

    return {
      jobs: items,
      totalCount,
      hasNextPage,
    };
  }

  public async getPayload(
    params: { projectId: string; jobId: string },
    transaction?: Transaction
  ): Promise<{
    payload: SyncProjectInput;
    importId: string | null;
    cdmVersion: number;
  }> {
    const row = await this.repo.getPayloadById(params.jobId, transaction);
    if (!row || row.projectId !== params.projectId) {
      throw new NotFoundError('ProjectSyncJob', params.jobId);
    }
    return {
      payload: row.payload,
      importId: row.importId,
      cdmVersion: row.cdmVersion,
    };
  }

  public async loadForExecution(
    params: { jobId: string },
    transaction?: Transaction
  ): Promise<ProjectSyncJobExecutionData> {
    const full = await this.repo.getFullById(params.jobId, transaction);
    if (!full) {
      throw new NotFoundError('ProjectSyncJob', params.jobId);
    }
    return {
      job: full.job,
      payload: full.payload,
      scope: { tenant: full.scopeTenant as Tenant, id: full.scopeId },
      cancelRequested: full.cancelRequested,
    };
  }

  public async findActiveByImportId(
    params: { projectId: string; importId: string },
    transaction?: Transaction
  ): Promise<ProjectSyncJob | null> {
    return this.repo.findActiveByImportId(params, transaction);
  }

  public async transitionToRunning(
    params: { jobId: string },
    transaction?: Transaction
  ): Promise<ProjectSyncJob> {
    const current = await this.repo.getById(params.jobId, transaction);
    if (!current) {
      throw new NotFoundError('ProjectSyncJob', params.jobId);
    }
    if (current.status !== ProjectSyncJobStatus.Pending) {
      throw new ConflictError(
        `Cannot transition job ${params.jobId} to RUNNING from status ${current.status}`
      );
    }
    const updated = await this.repo.updateStatus(
      {
        jobId: params.jobId,
        status: ProjectSyncJobStatus.Running,
        startedAt: new Date(),
      },
      transaction
    );
    await this.audit.logUpdate(
      params.jobId,
      compactJobSummary(current),
      compactJobSummary(updated),
      { transition: 'PENDING_TO_RUNNING' },
      transaction
    );
    return updated;
  }

  public async markCompleted(
    params: { jobId: string; result: SyncProjectResult; warnings: string[] },
    transaction?: Transaction
  ): Promise<ProjectSyncJob> {
    const current = await this.repo.getById(params.jobId, transaction);
    if (!current) {
      throw new NotFoundError('ProjectSyncJob', params.jobId);
    }
    if (current.status !== ProjectSyncJobStatus.Running) {
      throw new ConflictError(
        `Cannot mark job ${params.jobId} COMPLETED from status ${current.status}`
      );
    }
    const updated = await this.repo.updateStatus(
      {
        jobId: params.jobId,
        status: ProjectSyncJobStatus.Completed,
        completedAt: new Date(),
        result: params.result,
        warnings: params.warnings,
      },
      transaction
    );
    await this.audit.logUpdate(
      params.jobId,
      compactJobSummary(current),
      {
        ...compactJobSummary(updated),
        ...compactResultSummary(params.result),
      },
      { transition: 'RUNNING_TO_COMPLETED' },
      transaction
    );
    return updated;
  }

  public async markFailed(
    params: { jobId: string; errorMessage: string; errorDetails?: Record<string, unknown> | null },
    transaction?: Transaction
  ): Promise<ProjectSyncJob> {
    const current = await this.repo.getById(params.jobId, transaction);
    if (!current) {
      throw new NotFoundError('ProjectSyncJob', params.jobId);
    }
    if (
      current.status !== ProjectSyncJobStatus.Running &&
      current.status !== ProjectSyncJobStatus.Pending
    ) {
      throw new ConflictError(
        `Cannot mark job ${params.jobId} FAILED from status ${current.status}`
      );
    }
    const updated = await this.repo.updateStatus(
      {
        jobId: params.jobId,
        status: ProjectSyncJobStatus.Failed,
        completedAt: new Date(),
        errorMessage: params.errorMessage,
        errorDetails: params.errorDetails ?? null,
      },
      transaction
    );
    await this.audit.logUpdate(
      params.jobId,
      compactJobSummary(current),
      {
        ...compactJobSummary(updated),
        errorMessage:
          params.errorMessage.length > 400
            ? `${params.errorMessage.slice(0, 397)}...`
            : params.errorMessage,
      },
      { transition: 'TO_FAILED' },
      transaction
    );
    return updated;
  }

  public async saveSnapshot(
    params: { jobId: string; snapshot: SyncProjectInput; takenAt: Date },
    transaction?: Transaction
  ): Promise<void> {
    /**
     * Compute byte length up front so the repository write is a single UPDATE.
     * Buffer is the canonical Node API for this; avoids allocating a Blob just
     * to read `.size`. Snapshots are JSON-serialisable by construction (we
     * just produced them via the export pipeline), so `JSON.stringify` here
     * cannot throw on circular refs.
     */
    const sizeBytes = Buffer.byteLength(JSON.stringify(params.snapshot), 'utf8');
    await this.repo.updateSnapshot(
      {
        jobId: params.jobId,
        snapshot: params.snapshot,
        takenAt: params.takenAt,
        sizeBytes,
      },
      transaction
    );
    await this.audit.logAction(
      {
        entityId: params.jobId,
        action: 'SNAPSHOT_CAPTURED',
        oldValues: null,
        newValues: { snapshotSizeBytes: sizeBytes },
        metadata: { snapshotTakenAt: params.takenAt.toISOString() },
      },
      transaction
    );
  }

  public async getSnapshot(
    params: { projectId: string; jobId: string },
    transaction?: Transaction
  ): Promise<{
    snapshot: SyncProjectInput;
    takenAt: Date;
    sizeBytes: number;
  } | null> {
    const row = await this.repo.getSnapshotById(params.jobId, transaction);
    if (!row) return null;
    if (row.projectId !== params.projectId) {
      // Treat a project-id mismatch as not-found rather than leaking the
      // existence of a job belonging to a different project. Mirrors the
      // approach in `getById` / `getPayload`.
      return null;
    }
    return {
      snapshot: row.snapshot,
      takenAt: row.takenAt,
      sizeBytes: row.sizeBytes,
    };
  }

  public async cancel(
    params: { projectId: string; jobId: string },
    transaction?: Transaction
  ): Promise<ProjectSyncJob> {
    const current = await this.repo.getById(params.jobId, transaction);
    if (!current || current.projectId !== params.projectId) {
      throw new NotFoundError('ProjectSyncJob', params.jobId);
    }
    if (current.status === ProjectSyncJobStatus.Pending) {
      // Hard cancel — the worker hasn't started yet, so we move to terminal.
      const updated = await this.repo.updateStatus(
        {
          jobId: params.jobId,
          status: ProjectSyncJobStatus.Cancelled,
          cancelledAt: new Date(),
          cancelRequested: new Date(),
        },
        transaction
      );
      await this.audit.logUpdate(
        params.jobId,
        compactJobSummary(current),
        compactJobSummary(updated),
        { transition: 'PENDING_TO_CANCELLED' },
        transaction
      );
      return updated;
    }
    if (current.status === ProjectSyncJobStatus.Running) {
      // Soft cancel — record the intent; the worker checks `cancelRequested`
      // between phases and finalises the cancellation. The status stays
      // RUNNING until the worker exits cooperatively.
      const requestedAt = new Date();
      const updated = await this.repo.updateStatus(
        {
          jobId: params.jobId,
          status: ProjectSyncJobStatus.Running,
          cancelRequested: requestedAt,
        },
        transaction
      );
      await this.audit.logAction(
        {
          entityId: params.jobId,
          action: 'CANCEL_REQUESTED',
          oldValues: compactJobSummary(current),
          newValues: { cancelRequestedAt: requestedAt.toISOString() },
          metadata: { note: 'running_job_soft_cancel' },
        },
        transaction
      );
      return updated;
    }
    throw new ConflictError(
      `Cannot cancel job ${params.jobId} in terminal status ${current.status}`
    );
  }
}
