/**
 * Unit tests for ProjectHandler.startProjectPermissionsSync. Focused on the
 * orchestration concerns the handler owns: input validation, idempotency on
 * `importId`, and dispatching the worker. The actual import work belongs to
 * `ProjectPermissionSyncService` and is exercised separately.
 */
import { ProjectPermissionsSyncJobStatus, Tenant } from '@grantjs/schema';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProjectHandler } from '@/handlers/projects.handler';

const projectId = '00000000-0000-4000-8000-000000000011';
const accountId = '00000000-0000-4000-8000-000000000020';
const userId = '30000000-0000-4000-8000-000000000099';

function buildJob(importId: string | null) {
  return {
    id: '40000000-0000-4000-8000-000000000077',
    projectId,
    status: ProjectPermissionsSyncJobStatus.Pending,
    cdmVersion: 1,
    importId,
    result: null,
    warnings: [],
    errorMessage: null,
    enqueuedAt: new Date(),
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
  };
}

function buildInput() {
  return {
    cdmVersion: 1,
    roleTemplates: [
      {
        externalKey: 'viewer',
        name: 'Viewer',
        permissionRefs: [{ resourceSlug: 'Tag', action: 'Query' }],
      },
    ],
    userAssignments: [{ userId, roleTemplateKeys: ['viewer'] }],
  };
}

function createHandler(opts: {
  jobsAdapter?: { enqueue: ReturnType<typeof vi.fn> } | null;
  syncJobs: {
    create: ReturnType<typeof vi.fn>;
    findActiveByImportId: ReturnType<typeof vi.fn>;
    getById?: ReturnType<typeof vi.fn>;
    cancel?: ReturnType<typeof vi.fn>;
  };
  scheduleAfterCommit?: (fn: () => void | Promise<void>) => void;
}) {
  return new ProjectHandler(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    opts.syncJobs as never,
    opts.jobsAdapter as never,
    {} as never,
    {} as never,
    {} as never,
    opts.scheduleAfterCommit
  );
}

describe('ProjectHandler.startProjectPermissionsSync', () => {
  let create: ReturnType<typeof vi.fn>;
  let findActiveByImportId: ReturnType<typeof vi.fn>;
  let enqueue: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    create = vi.fn();
    findActiveByImportId = vi.fn();
    enqueue = vi.fn().mockResolvedValue(undefined);
  });

  it('does not call enqueue until scheduleAfterCommit runs (matches post-commit BullMQ dispatch)', async () => {
    const job = buildJob(null);
    create.mockResolvedValue(job);

    const deferred: Array<() => void | Promise<void>> = [];
    const scheduleAfterCommit = (fn: () => void | Promise<void>) => {
      deferred.push(fn);
    };

    const handler = createHandler({
      jobsAdapter: { enqueue },
      syncJobs: { create, findActiveByImportId },
      scheduleAfterCommit,
    });

    await handler.startProjectPermissionsSync({
      id: projectId,
      scope: { tenant: Tenant.AccountProject, id: `${accountId}:${projectId}` },
      input: buildInput(),
      enqueuedById: userId,
    });

    expect(enqueue).not.toHaveBeenCalled();
    expect(deferred).toHaveLength(1);
    await Promise.resolve(deferred[0]?.());
    expect(enqueue).toHaveBeenCalledTimes(1);
    expect(enqueue).toHaveBeenCalledWith('project-permissions-sync', {
      scope: { tenant: Tenant.AccountProject, id: `${accountId}:${projectId}` },
      payload: { jobRecordId: job.id },
    });
  });

  it('creates a job record and enqueues exactly once when no importId is supplied', async () => {
    const job = buildJob(null);
    create.mockResolvedValue(job);

    const handler = createHandler({
      jobsAdapter: { enqueue },
      syncJobs: { create, findActiveByImportId },
    });

    const result = await handler.startProjectPermissionsSync({
      id: projectId,
      scope: { tenant: Tenant.AccountProject, id: `${accountId}:${projectId}` },
      input: buildInput(),
      enqueuedById: userId,
    });

    expect(result).toBe(job);
    expect(findActiveByImportId).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledTimes(1);
    expect(enqueue).toHaveBeenCalledTimes(1);
    expect(enqueue).toHaveBeenCalledWith('project-permissions-sync', {
      scope: { tenant: Tenant.AccountProject, id: `${accountId}:${projectId}` },
      payload: { jobRecordId: job.id },
    });
  });

  it('returns the existing in-flight job and does not re-enqueue when importId is already pending', async () => {
    const importId = 'import-123';
    const inflight = buildJob(importId);
    findActiveByImportId.mockResolvedValue(inflight);

    const handler = createHandler({
      jobsAdapter: { enqueue },
      syncJobs: { create, findActiveByImportId },
    });

    const result = await handler.startProjectPermissionsSync({
      id: projectId,
      scope: { tenant: Tenant.AccountProject, id: `${accountId}:${projectId}` },
      input: { ...buildInput(), importId },
      enqueuedById: userId,
    });

    expect(result).toBe(inflight);
    expect(findActiveByImportId).toHaveBeenCalledWith({ projectId, importId });
    expect(create).not.toHaveBeenCalled();
    expect(enqueue).not.toHaveBeenCalled();
  });

  it('throws ConfigurationError when the job adapter is not configured', async () => {
    const handler = createHandler({
      jobsAdapter: null,
      syncJobs: { create, findActiveByImportId },
    });

    await expect(
      handler.startProjectPermissionsSync({
        id: projectId,
        scope: { tenant: Tenant.AccountProject, id: `${accountId}:${projectId}` },
        input: buildInput(),
        enqueuedById: userId,
      })
    ).rejects.toThrow(/job adapter is not configured/);
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects validation errors before persisting or enqueueing', async () => {
    const handler = createHandler({
      jobsAdapter: { enqueue },
      syncJobs: { create, findActiveByImportId },
    });

    await expect(
      handler.startProjectPermissionsSync({
        id: projectId,
        scope: { tenant: Tenant.AccountProject, id: `${accountId}:${projectId}` },
        input: { ...buildInput(), cdmVersion: 999 },
        enqueuedById: userId,
      })
    ).rejects.toThrow(/cdmVersion/);
    expect(create).not.toHaveBeenCalled();
    expect(enqueue).not.toHaveBeenCalled();
  });

  it('rejects when scope id does not contain the projectId', async () => {
    const handler = createHandler({
      jobsAdapter: { enqueue },
      syncJobs: { create, findActiveByImportId },
    });

    await expect(
      handler.startProjectPermissionsSync({
        id: projectId,
        scope: {
          tenant: Tenant.AccountProject,
          id: `${accountId}:00000000-0000-4000-8000-other-projectx`,
        },
        input: buildInput(),
        enqueuedById: userId,
      })
    ).rejects.toThrow(/same projectId/);
    expect(findActiveByImportId).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });
});
