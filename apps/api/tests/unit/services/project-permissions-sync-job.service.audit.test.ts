/**
 * Ensures permission sync job lifecycle writes append-only audit rows.
 */
import type { IAuditLogger } from '@grantjs/core';
import { ProjectPermissionsSyncJobStatus, Tenant } from '@grantjs/schema';
import { describe, expect, it, vi } from 'vitest';

import { ProjectPermissionsSyncJobService } from '@/services/project-permissions-sync-job.service';

const jobId = '40000000-0000-4000-8000-000000000077';
const projectId = '00000000-0000-4000-8000-000000000011';

function buildJob(overrides: Partial<{ status: ProjectPermissionsSyncJobStatus }> = {}) {
  return {
    id: jobId,
    projectId,
    status: overrides.status ?? ProjectPermissionsSyncJobStatus.Pending,
    cdmVersion: 1,
    importId: null as string | null,
    result: null,
    warnings: [] as string[],
    errorMessage: null as string | null,
    enqueuedAt: new Date(),
    startedAt: null as Date | null,
    completedAt: null as Date | null,
    cancelledAt: null as Date | null,
    hasSnapshot: false,
    snapshotTakenAt: null as string | null,
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

describe('ProjectPermissionsSyncJobService audit', () => {
  it('records CREATE after enqueue', async () => {
    const inserted = buildJob();
    const repo = {
      insert: vi.fn().mockResolvedValue(inserted),
    };
    const audit = noopAudit();
    const svc = new ProjectPermissionsSyncJobService(repo as never, audit);

    await svc.create({
      projectId,
      scope: { tenant: Tenant.AccountProject, id: `acct:${projectId}` },
      cdmVersion: 1,
      importId: null,
      payload: { cdmVersion: 1, roleTemplates: [], userAssignments: [] },
      enqueuedById: '30000000-0000-4000-8000-000000000099',
    });

    expect(audit.logCreate).toHaveBeenCalledTimes(1);
    expect(vi.mocked(audit.logCreate).mock.calls[0][0]).toBe(jobId);
    expect(vi.mocked(audit.logCreate).mock.calls[0][1]).toMatchObject({
      status: ProjectPermissionsSyncJobStatus.Pending,
      projectId,
      cdmVersion: 1,
    });
  });

  it('records UPDATE when transitioning to RUNNING', async () => {
    const pending = buildJob({ status: ProjectPermissionsSyncJobStatus.Pending });
    const running = buildJob({ status: ProjectPermissionsSyncJobStatus.Running });
    running.startedAt = new Date();

    const repo = {
      getById: vi.fn().mockResolvedValueOnce(pending),
      updateStatus: vi.fn().mockResolvedValue(running),
    };
    const audit = noopAudit();
    const svc = new ProjectPermissionsSyncJobService(repo as never, audit);

    await svc.transitionToRunning({ jobId });

    expect(audit.logUpdate).toHaveBeenCalledTimes(1);
    expect(vi.mocked(audit.logUpdate).mock.calls[0][3]).toMatchObject({
      transition: 'PENDING_TO_RUNNING',
    });
  });

  it('records CANCEL_REQUESTED for a running job', async () => {
    const running = buildJob({ status: ProjectPermissionsSyncJobStatus.Running });
    const updated = { ...running };

    const repo = {
      getById: vi.fn().mockResolvedValue(running),
      updateStatus: vi.fn().mockResolvedValue(updated),
    };
    const audit = noopAudit();
    const svc = new ProjectPermissionsSyncJobService(repo as never, audit);

    await svc.cancel({ projectId, jobId });

    expect(audit.logAction).toHaveBeenCalledTimes(1);
    expect(vi.mocked(audit.logAction).mock.calls[0][0]).toMatchObject({
      entityId: jobId,
      action: 'CANCEL_REQUESTED',
    });
  });
});
