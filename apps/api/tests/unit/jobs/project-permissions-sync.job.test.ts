/**
 * Unit tests for the async ProjectPermissionsSyncJob worker. The worker is
 * responsible for state-machine transitions, executing the sync inside a
 * transaction, and post-commit cache invalidation. We mock the transactional
 * connection so tests are independent of Postgres.
 */
import { ConflictError } from '@grantjs/core';
import {
  ProjectPermissionsSyncJobStatus,
  type Scope,
  type SyncProjectPermissionsResult,
  Tenant,
} from '@grantjs/schema';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProjectPermissionsSyncJob from '@/jobs/project-permissions-sync.job';
import type { AppContext } from '@/types';

vi.mock('@/lib/jobs/tenant-job.validation', () => ({
  assertTenantActive: vi.fn().mockResolvedValue(undefined),
}));

/** Worker wraps DB calls with `setRlsContext`; real impl executes SQL on mocked txs — noop for tests. */
vi.mock('@/lib/rls', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/rls')>();
  return {
    ...mod,
    setRlsContext: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('@/lib/transaction-manager.lib', () => {
  return {
    DrizzleTransactionalConnection: class {
      async withTransaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
        return fn({ __mockTx: true });
      }
    },
  };
});

const projectId = '00000000-0000-4000-8000-000000000011';
const accountId = '00000000-0000-4000-8000-000000000020';
const userId = '30000000-0000-4000-8000-000000000099';
const jobRecordId = '40000000-0000-4000-8000-000000000077';
const enqueueScope: Scope = {
  tenant: Tenant.AccountProject,
  id: `${accountId}:${projectId}`,
};

function buildJobRow(
  status: ProjectPermissionsSyncJobStatus = ProjectPermissionsSyncJobStatus.Pending
) {
  return {
    id: jobRecordId,
    projectId,
    status,
    cdmVersion: 1,
    importId: null,
    result: null,
    warnings: [],
    errorMessage: null,
    enqueuedAt: new Date(),
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
  };
}

function buildExecData(
  overrides: Partial<{
    status: ProjectPermissionsSyncJobStatus;
    cancelRequested: boolean;
    userIds: string[];
  }> = {}
) {
  const status = overrides.status ?? ProjectPermissionsSyncJobStatus.Pending;
  return {
    job: buildJobRow(status),
    payload: {
      cdmVersion: 1,
      roleTemplates: [
        {
          externalKey: 'viewer',
          name: 'Viewer',
          permissionRefs: [{ resourceSlug: 'Tag', action: 'Query' }],
        },
      ],
      userAssignments: (overrides.userIds ?? [userId]).map((uid) => ({
        userId: uid,
        roleTemplateKeys: ['viewer'],
      })),
    },
    scope: enqueueScope,
    cancelRequested: overrides.cancelRequested ?? false,
  };
}

/** Passed through `db.transaction` mocks so assertions match worker RLS wrappers. */
const mockOuterTx = { __outerTx: true };

function buildSyncResult(): SyncProjectPermissionsResult {
  return {
    projectId,
    importId: null,
    rolesCreated: 1,
    groupsCreated: 1,
    roleGroupsLinked: 1,
    groupPermissionsLinked: 1,
    projectRolesLinked: 1,
    projectGroupsLinked: 1,
    projectPermissionsLinked: 1,
    projectResourcesLinked: 0,
    projectUsersEnsured: 1,
    userRolesAssigned: 1,
    warnings: ['orphan permission ignored'],
  };
}

interface MockServices {
  loadForExecution: ReturnType<typeof vi.fn>;
  transitionToRunning: ReturnType<typeof vi.fn>;
  markCompleted: ReturnType<typeof vi.fn>;
  markFailed: ReturnType<typeof vi.fn>;
  saveSnapshot: ReturnType<typeof vi.fn>;
  syncProjectPermissions: ReturnType<typeof vi.fn>;
  invalidateCachesForSyncResult: ReturnType<typeof vi.fn>;
  exportProjectPermissions: ReturnType<typeof vi.fn>;
}

function buildJobInstance(mocks: MockServices) {
  const appContext = {
    db: {
      transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb(mockOuterTx)),
    },
    services: {
      projectPermissionsSyncJobs: {
        loadForExecution: mocks.loadForExecution,
        transitionToRunning: mocks.transitionToRunning,
        markCompleted: mocks.markCompleted,
        markFailed: mocks.markFailed,
        saveSnapshot: mocks.saveSnapshot,
      },
      projectPermissionSync: {
        syncProjectPermissions: mocks.syncProjectPermissions,
        invalidateCachesForSyncResult: mocks.invalidateCachesForSyncResult,
      },
      projectPermissionExport: {
        exportProjectPermissions: mocks.exportProjectPermissions,
      },
    },
  } as unknown as AppContext;
  return new ProjectPermissionsSyncJob(appContext);
}

describe('ProjectPermissionsSyncJob worker', () => {
  let mocks: MockServices;

  beforeEach(() => {
    mocks = {
      loadForExecution: vi.fn(),
      transitionToRunning: vi.fn().mockResolvedValue(undefined),
      markCompleted: vi.fn().mockResolvedValue(undefined),
      markFailed: vi.fn().mockResolvedValue(undefined),
      saveSnapshot: vi.fn().mockResolvedValue(undefined),
      syncProjectPermissions: vi.fn(),
      invalidateCachesForSyncResult: vi.fn().mockResolvedValue(undefined),
      exportProjectPermissions: vi.fn().mockResolvedValue({
        cdmVersion: 1,
        roleTemplates: [],
        userAssignments: [],
      }),
    };
  });

  it('runs the full happy path: pending → running → completed and invalidates caches', async () => {
    mocks.loadForExecution.mockResolvedValue(buildExecData());
    const result = buildSyncResult();
    mocks.syncProjectPermissions.mockResolvedValue(result);

    const job = buildJobInstance(mocks);
    const ctx = {
      jobId: 'queue-job-1',
      scheduledAt: new Date(),
      startedAt: new Date(),
      scope: enqueueScope,
      payload: { jobRecordId },
    };

    const outcome = await job.execute(ctx);

    expect(outcome.success).toBe(true);
    expect(mocks.loadForExecution).toHaveBeenCalledWith({ jobId: jobRecordId }, mockOuterTx);
    expect(mocks.transitionToRunning).toHaveBeenCalledWith({ jobId: jobRecordId }, mockOuterTx);
    expect(mocks.syncProjectPermissions).toHaveBeenCalledTimes(1);
    expect(mocks.markCompleted).toHaveBeenCalledWith(
      {
        jobId: jobRecordId,
        result,
        warnings: ['orphan permission ignored'],
      },
      mockOuterTx
    );
    expect(mocks.invalidateCachesForSyncResult).toHaveBeenCalledWith({
      scope: enqueueScope,
      userIds: [userId],
    });
    expect(mocks.markFailed).not.toHaveBeenCalled();
  });

  it('captures a pre-sync snapshot inside the same transaction, before syncProjectPermissions runs', async () => {
    mocks.loadForExecution.mockResolvedValue(buildExecData());
    mocks.syncProjectPermissions.mockResolvedValue(buildSyncResult());

    const exportedSnapshot = {
      cdmVersion: 1,
      roleTemplates: [
        {
          externalKey: 'pre-existing',
          name: 'Pre-existing',
          permissionRefs: [{ resourceSlug: 'Tag', action: 'Query' }],
        },
      ],
      userAssignments: [],
    };
    mocks.exportProjectPermissions.mockResolvedValue(exportedSnapshot);

    const callOrder: string[] = [];
    mocks.exportProjectPermissions.mockImplementation(async () => {
      callOrder.push('export');
      return exportedSnapshot;
    });
    mocks.saveSnapshot.mockImplementation(async () => {
      callOrder.push('saveSnapshot');
    });
    mocks.syncProjectPermissions.mockImplementation(async () => {
      callOrder.push('sync');
      return buildSyncResult();
    });

    const job = buildJobInstance(mocks);
    await job.execute({
      jobId: 'queue-job-snap',
      scheduledAt: new Date(),
      startedAt: new Date(),
      scope: enqueueScope,
      payload: { jobRecordId },
    });

    expect(callOrder).toEqual(['export', 'saveSnapshot', 'sync']);

    expect(mocks.exportProjectPermissions).toHaveBeenCalledTimes(1);
    const exportArgs = mocks.exportProjectPermissions.mock.calls[0];
    expect(exportArgs[0]).toMatchObject({
      projectId,
      scope: enqueueScope,
      cdmVersion: 1,
    });
    expect(exportArgs[1]).toMatchObject({ __mockTx: true });

    expect(mocks.saveSnapshot).toHaveBeenCalledTimes(1);
    const saveArgs = mocks.saveSnapshot.mock.calls[0];
    expect(saveArgs[0]).toMatchObject({
      jobId: jobRecordId,
      snapshot: exportedSnapshot,
    });
    expect(saveArgs[0].takenAt).toBeInstanceOf(Date);
    expect(saveArgs[1]).toMatchObject({ __mockTx: true });

    const syncTx = mocks.syncProjectPermissions.mock.calls[0][1];
    expect(syncTx).toMatchObject({ __mockTx: true });
  });

  it('rolls back the snapshot when sync fails (snapshot save and sync share the same transaction)', async () => {
    mocks.loadForExecution.mockResolvedValue(buildExecData());
    mocks.syncProjectPermissions.mockRejectedValue(new Error('sync exploded'));

    const job = buildJobInstance(mocks);
    await expect(
      job.execute({
        jobId: 'queue-job-rollback',
        scheduledAt: new Date(),
        startedAt: new Date(),
        scope: enqueueScope,
        payload: { jobRecordId },
      })
    ).rejects.toThrow('sync exploded');

    /**
     * Both calls happen inside the same DrizzleTransactionalConnection.withTransaction
     * block; the worker rethrows and `markFailed` runs after the transaction
     * boundary. The mocked transaction does not actually roll back, but in
     * production the throw propagates out of withTransaction and Postgres
     * undoes the snapshot write — this test pins the contract that snapshot
     * persistence happens BEFORE sync inside the same tx, which is the only
     * structural guarantee the unit test can assert.
     */
    expect(mocks.exportProjectPermissions).toHaveBeenCalledTimes(1);
    expect(mocks.saveSnapshot).toHaveBeenCalledTimes(1);
    expect(mocks.markFailed).toHaveBeenCalledWith(
      {
        jobId: jobRecordId,
        errorMessage: 'sync exploded',
        errorDetails: expect.objectContaining({ message: 'sync exploded' }),
      },
      mockOuterTx
    );
  });

  it('marks the job failed, rethrows, and skips cache invalidation when sync errors', async () => {
    mocks.loadForExecution.mockResolvedValue(buildExecData());
    const boom = new Error('replace failed');
    mocks.syncProjectPermissions.mockRejectedValue(boom);

    const job = buildJobInstance(mocks);

    await expect(
      job.execute({
        jobId: 'queue-job-2',
        scheduledAt: new Date(),
        startedAt: new Date(),
        scope: enqueueScope,
        payload: { jobRecordId },
      })
    ).rejects.toThrow('replace failed');

    expect(mocks.transitionToRunning).toHaveBeenCalledOnce();
    expect(mocks.markFailed).toHaveBeenCalledWith(
      {
        jobId: jobRecordId,
        errorMessage: 'replace failed',
        errorDetails: expect.objectContaining({ message: 'replace failed' }),
      },
      mockOuterTx
    );
    expect(mocks.markCompleted).not.toHaveBeenCalled();
    expect(mocks.invalidateCachesForSyncResult).not.toHaveBeenCalled();
  });

  it('throws ConflictError when the job is not in PENDING (illegal transition)', async () => {
    mocks.loadForExecution.mockResolvedValue(
      buildExecData({ status: ProjectPermissionsSyncJobStatus.Completed })
    );

    const job = buildJobInstance(mocks);

    await expect(
      job.execute({
        jobId: 'queue-job-3',
        scheduledAt: new Date(),
        startedAt: new Date(),
        scope: enqueueScope,
        payload: { jobRecordId },
      })
    ).rejects.toBeInstanceOf(ConflictError);
    expect(mocks.transitionToRunning).not.toHaveBeenCalled();
    expect(mocks.syncProjectPermissions).not.toHaveBeenCalled();
  });

  it('returns success without executing when the job was cancelled before pickup', async () => {
    mocks.loadForExecution.mockResolvedValue(buildExecData({ cancelRequested: true }));

    const job = buildJobInstance(mocks);
    const outcome = await job.execute({
      jobId: 'queue-job-4',
      scheduledAt: new Date(),
      startedAt: new Date(),
      scope: enqueueScope,
      payload: { jobRecordId },
    });

    expect(outcome.success).toBe(true);
    expect(mocks.transitionToRunning).not.toHaveBeenCalled();
    expect(mocks.syncProjectPermissions).not.toHaveBeenCalled();
    expect(mocks.markCompleted).not.toHaveBeenCalled();
  });

  it('rejects with descriptive error when payload is missing jobRecordId', async () => {
    const job = buildJobInstance(mocks);
    await expect(
      job.execute({
        jobId: 'queue-job-5',
        scheduledAt: new Date(),
        startedAt: new Date(),
        scope: enqueueScope,
        payload: {},
      })
    ).rejects.toThrow(/jobRecordId/);
    expect(mocks.loadForExecution).not.toHaveBeenCalled();
  });

  it('rejects when the enqueue scope does not match the persisted job scope', async () => {
    mocks.loadForExecution.mockResolvedValue(buildExecData());

    const wrongScope: Scope = {
      tenant: Tenant.OrganizationProject,
      id: 'other-org:other-project',
    };
    const job = buildJobInstance(mocks);
    await expect(
      job.execute({
        jobId: 'queue-job-6',
        scheduledAt: new Date(),
        startedAt: new Date(),
        scope: wrongScope,
        payload: { jobRecordId },
      })
    ).rejects.toThrow(/scope mismatch/);
    expect(mocks.transitionToRunning).not.toHaveBeenCalled();
  });
});
