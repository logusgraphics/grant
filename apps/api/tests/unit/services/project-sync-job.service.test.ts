/**
 * Unit tests for ProjectSyncJobService lifecycle transitions (non-audit).
 */
import type { IAuditLogger } from '@grantjs/core';
import { ConflictError } from '@grantjs/core';
import {
  CdmModeStrategy,
  ProjectSyncJobOperation,
  ProjectSyncJobStatus,
  Tenant,
} from '@grantjs/schema';
import { describe, expect, it, vi } from 'vitest';

import { ProjectSyncJobService } from '@/services/project-sync-job.service';

const jobId = '40000000-0000-4000-8000-000000000077';
const projectId = '00000000-0000-4000-8000-000000000011';

function buildJob(status: ProjectSyncJobStatus) {
  return {
    id: jobId,
    projectId,
    status,
    cdmVersion: 1,
    jobName: null as string | null,
    operation: ProjectSyncJobOperation.Import,
    modeStrategy: CdmModeStrategy.Merge,
    result: null,
    warnings: [] as string[],
    errorMessage: null as string | null,
    enqueuedAt: new Date(),
    startedAt: status === ProjectSyncJobStatus.Running ? new Date() : null,
    completedAt: null as Date | null,
    cancelledAt: null as Date | null,
    hasSnapshot: false,
    snapshotTakenAt: null as Date | null,
    snapshotSizeBytes: null as number | null,
  };
}

function noopAudit(): IAuditLogger {
  return {
    logAction: vi.fn().mockResolvedValue(undefined),
    logCreate: vi.fn().mockResolvedValue(undefined),
    logUpdate: vi.fn().mockResolvedValue(undefined),
    logSoftDelete: vi.fn().mockResolvedValue(undefined),
    logHardDelete: vi.fn().mockResolvedValue(undefined),
  };
}

function createService(repo: {
  getById: ReturnType<typeof vi.fn>;
  updateStatus: ReturnType<typeof vi.fn>;
}) {
  return new ProjectSyncJobService(repo as never, noopAudit());
}

describe('ProjectSyncJobService.cancel', () => {
  it('cancels a PENDING job immediately', async () => {
    const pending = buildJob(ProjectSyncJobStatus.Pending);
    const cancelled = buildJob(ProjectSyncJobStatus.Cancelled);
    const getById = vi.fn().mockResolvedValue(pending);
    const updateStatus = vi.fn().mockResolvedValue(cancelled);
    const svc = createService({ getById, updateStatus });

    const result = await svc.cancel({ projectId, jobId });

    expect(result.status).toBe(ProjectSyncJobStatus.Cancelled);
    expect(updateStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId,
        status: ProjectSyncJobStatus.Cancelled,
      }),
      undefined
    );
  });

  it('sets cancelRequested on a RUNNING job without changing status', async () => {
    const running = buildJob(ProjectSyncJobStatus.Running);
    const getById = vi.fn().mockResolvedValue(running);
    const updateStatus = vi.fn().mockImplementation(async (params) => ({
      ...running,
      status: params.status,
    }));
    const svc = createService({ getById, updateStatus });

    const result = await svc.cancel({ projectId, jobId });

    expect(result.status).toBe(ProjectSyncJobStatus.Running);
    expect(updateStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId,
        status: ProjectSyncJobStatus.Running,
        cancelRequested: expect.any(Date),
      }),
      undefined
    );
  });

  it('throws ConflictError when cancelling a COMPLETED job', async () => {
    const completed = buildJob(ProjectSyncJobStatus.Completed);
    const svc = createService({
      getById: vi.fn().mockResolvedValue(completed),
      updateStatus: vi.fn(),
    });

    await expect(svc.cancel({ projectId, jobId })).rejects.toBeInstanceOf(ConflictError);
  });

  it('throws ConflictError when cancelling a FAILED job', async () => {
    const failed = buildJob(ProjectSyncJobStatus.Failed);
    const svc = createService({
      getById: vi.fn().mockResolvedValue(failed),
      updateStatus: vi.fn(),
    });

    await expect(svc.cancel({ projectId, jobId })).rejects.toBeInstanceOf(ConflictError);
  });
});

describe('ProjectSyncJobService.transitionToRunning', () => {
  it('transitions PENDING to RUNNING', async () => {
    const pending = buildJob(ProjectSyncJobStatus.Pending);
    const running = buildJob(ProjectSyncJobStatus.Running);
    const svc = createService({
      getById: vi.fn().mockResolvedValue(pending),
      updateStatus: vi.fn().mockResolvedValue(running),
    });

    const result = await svc.transitionToRunning({ jobId });

    expect(result.status).toBe(ProjectSyncJobStatus.Running);
  });

  it('throws ConflictError when job is not PENDING', async () => {
    const running = buildJob(ProjectSyncJobStatus.Running);
    const svc = createService({
      getById: vi.fn().mockResolvedValue(running),
      updateStatus: vi.fn(),
    });

    await expect(svc.transitionToRunning({ jobId })).rejects.toBeInstanceOf(ConflictError);
  });
});

describe('ProjectSyncJobService.markFailed', () => {
  it('marks a RUNNING job as FAILED with error message', async () => {
    const running = buildJob(ProjectSyncJobStatus.Running);
    const failed = buildJob(ProjectSyncJobStatus.Failed);
    const updateStatus = vi.fn().mockResolvedValue(failed);
    const svc = createService({
      getById: vi.fn().mockResolvedValue(running),
      updateStatus,
    });

    const result = await svc.markFailed({ jobId, errorMessage: 'sync exploded' });

    expect(result.status).toBe(ProjectSyncJobStatus.Failed);
    expect(updateStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ProjectSyncJobStatus.Failed,
        errorMessage: 'sync exploded',
      }),
      undefined
    );
  });

  it('marks a PENDING job as FAILED', async () => {
    const pending = buildJob(ProjectSyncJobStatus.Pending);
    const failed = buildJob(ProjectSyncJobStatus.Failed);
    const svc = createService({
      getById: vi.fn().mockResolvedValue(pending),
      updateStatus: vi.fn().mockResolvedValue(failed),
    });

    const result = await svc.markFailed({ jobId, errorMessage: 'never started' });

    expect(result.status).toBe(ProjectSyncJobStatus.Failed);
  });

  it('throws ConflictError when marking COMPLETED job as FAILED', async () => {
    const completed = buildJob(ProjectSyncJobStatus.Completed);
    const svc = createService({
      getById: vi.fn().mockResolvedValue(completed),
      updateStatus: vi.fn(),
    });

    await expect(svc.markFailed({ jobId, errorMessage: 'too late' })).rejects.toBeInstanceOf(
      ConflictError
    );
  });
});

describe('ProjectSyncJobService.create validation', () => {
  it('rejects unsupported cdmVersion', async () => {
    const svc = new ProjectSyncJobService({ insert: vi.fn() } as never, noopAudit());

    await expect(
      svc.create({
        projectId,
        scope: { tenant: Tenant.AccountProject, id: `acct:${projectId}` },
        cdmVersion: 2,
        jobName: null,
        operation: 'import',
        modeStrategy: 'merge',
        payload: {},
        enqueuedById: 'user-1',
      })
    ).rejects.toThrow(/cdmVersion/);
  });
});
