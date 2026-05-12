/**
 * Integration: REST routes for the async CDM permission sync flow:
 *   POST   /api/projects/:id/permissions/sync-jobs                  — enqueue a job
 *   GET    /api/projects/:id/permissions/sync-jobs                  — paginated list
 *   GET    /api/projects/:id/permissions/sync-jobs/:jobId           — poll status
 *   GET    /api/projects/:id/permissions/sync-jobs/:jobId/payload   — download original CDM JSON
 *   DELETE /api/projects/:id/permissions/sync-jobs/:jobId           — cancel
 */
import { CdmFindBy, CdmModeStrategy, type SyncProjectPermissionsInput } from '@grantjs/schema';
import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { assertValidCdmExportSections } from '@/constants/cdm-export.constants';
import { errorHandler } from '@/middleware/error.middleware';
import { createProjectsRouter } from '@/rest/routes/projects.routes';
import type { RequestContext } from '@/types';

const noopLogger = {
  trace: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  fatal: vi.fn(),
  child: () => noopLogger,
};

vi.mock('@/middleware/request-logging.middleware', () => ({
  getRequestLogger: () => noopLogger,
}));

vi.mock('@/lib/authorization', () => ({
  authorizeRestRoute:
    () => (_req: express.Request, _res: express.Response, next: express.NextFunction) =>
      next(),
  requireEmailThenMfaRest:
    () => (_req: express.Request, _res: express.Response, next: express.NextFunction) =>
      next(),
}));

const projectId = '00000000-0000-4000-8000-000000000011';
const accountId = '00000000-0000-4000-8000-000000000020';
const userId = '30000000-0000-4000-8000-000000000099';
const jobId = '40000000-0000-4000-8000-000000000077';
const enqueuedAt = '2026-05-02T10:00:00.000Z';

const canonicalMode: SyncProjectPermissionsInput['mode'] = {
  strategy: CdmModeStrategy.Merge,
  onConflict: null,
  confirmDestructive: false,
};

function emptyCdm(
  overrides: Partial<SyncProjectPermissionsInput> = {}
): SyncProjectPermissionsInput {
  return {
    version: 1,
    id: null,
    mode: canonicalMode,
    roles: [],
    users: [],
    resources: [],
    permissions: [],
    groups: [],
    tags: [],
    ...overrides,
  };
}

function buildJobResponse(status: 'PENDING' | 'COMPLETED' | 'CANCELLED' = 'PENDING') {
  return {
    id: jobId,
    projectId,
    status,
    cdmVersion: 1,
    importId: null,
    result: null,
    warnings: [],
    errorMessage: null,
    enqueuedAt,
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    hasSnapshot: false,
    snapshotTakenAt: null,
    snapshotSizeBytes: null,
  };
}

describe('project permissions sync REST (async jobs)', () => {
  let app: express.Express;
  let startProjectPermissionsSync: ReturnType<typeof vi.fn>;
  let getProjectPermissionsSyncJob: ReturnType<typeof vi.fn>;
  let listProjectPermissionsSyncJobs: ReturnType<typeof vi.fn>;
  let getProjectPermissionsSyncJobPayload: ReturnType<typeof vi.fn>;
  let getProjectPermissionsSyncJobSnapshot: ReturnType<typeof vi.fn>;
  let exportProjectPermissions: ReturnType<typeof vi.fn>;
  let cancelProjectPermissionsSync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    startProjectPermissionsSync = vi.fn().mockResolvedValue(buildJobResponse('PENDING'));
    getProjectPermissionsSyncJob = vi.fn().mockResolvedValue(buildJobResponse('COMPLETED'));
    listProjectPermissionsSyncJobs = vi.fn().mockResolvedValue({
      jobs: [buildJobResponse('COMPLETED'), buildJobResponse('PENDING')],
      totalCount: 2,
      hasNextPage: false,
    });
    getProjectPermissionsSyncJobPayload = vi.fn().mockResolvedValue({
      payload: emptyCdm({ id: 'imp-1' }),
      importId: 'imp-1',
      cdmVersion: 1,
    });
    getProjectPermissionsSyncJobSnapshot = vi.fn().mockResolvedValue({
      snapshot: emptyCdm({
        roles: [
          {
            key: 'role-1',
            name: 'Existing role',
            description: null,
            groups: [],
            permissions: [],
            tags: [],
            primaryTag: null,
            metadata: null,
          },
        ],
      }),
      takenAt: new Date('2026-05-02T10:05:00.000Z'),
      sizeBytes: 1234,
    });
    /** Mirrors {@link ProjectsHandler.exportProjectPermissions} section validation so REST tests exercise real rules (mock replaces the full handler). */
    exportProjectPermissions = vi.fn(
      async (args: {
        id: string;
        scope: { tenant: string; id: string };
        version?: number | null;
        sections?: readonly string[] | string;
      }) => {
        const raw = args.sections;
        if (raw != null && (typeof raw === 'string' ? raw.trim().length > 0 : raw.length > 0)) {
          assertValidCdmExportSections(raw);
        }
        return emptyCdm();
      }
    );
    cancelProjectPermissionsSync = vi.fn().mockResolvedValue(buildJobResponse('CANCELLED'));

    const context = {
      user: { userId },
      handlers: {
        projects: {
          startProjectPermissionsSync,
          getProjectPermissionsSyncJob,
          listProjectPermissionsSyncJobs,
          getProjectPermissionsSyncJobPayload,
          getProjectPermissionsSyncJobSnapshot,
          exportProjectPermissions,
          cancelProjectPermissionsSync,
        },
      },
    } as unknown as RequestContext;

    app = express();
    app.use(express.json());
    app.use('/api/projects', createProjectsRouter(context));
    app.use(errorHandler);
  });

  it('POST /sync-jobs returns 202 with the persisted job and forwards enqueuedById from auth context', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/permissions/sync-jobs`)
      .send({
        scope: { tenant: 'accountProject', id: `${accountId}:${projectId}` },
        version: 1,
        mode: canonicalMode,
        roles: [
          {
            key: 'viewer',
            name: 'Viewer',
            description: null,
            groups: [],
            permissions: [],
            tags: [],
            primaryTag: null,
            metadata: { legacyRoleKey: 'viewer' },
          },
        ],
        users: [
          {
            key: { value: userId, findBy: CdmFindBy.Id },
            name: 'Member',
            roles: ['viewer'],
            groups: [],
            permissions: [],
            tags: [],
            primaryTag: null,
            apiKeys: [],
            metadata: { legacyUserKey: 'u-1' },
          },
        ],
      });

    expect(res.status).toBe(202);
    expect(res.body.data).toMatchObject({
      id: jobId,
      projectId,
      status: 'PENDING',
    });
    expect(startProjectPermissionsSync).toHaveBeenCalledTimes(1);
    expect(startProjectPermissionsSync.mock.calls[0][0]).toMatchObject({
      id: projectId,
      enqueuedById: userId,
      input: {
        version: 1,
        mode: canonicalMode,
        roles: [
          expect.objectContaining({
            key: 'viewer',
            metadata: { legacyRoleKey: 'viewer' },
          }),
        ],
        users: [
          expect.objectContaining({
            key: { value: userId, findBy: CdmFindBy.Id },
            metadata: { legacyUserKey: 'u-1' },
          }),
        ],
      },
    });
  });

  it('POST /sync-jobs forwards tags, nested user api keys, and tag cross-references end-to-end', async () => {
    const tagId = '60000000-0000-4000-8000-000000000aaa';
    const res = await request(app)
      .post(`/api/projects/${projectId}/permissions/sync-jobs`)
      .send({
        scope: { tenant: 'accountProject', id: `${accountId}:${projectId}` },
        version: 1,
        id: 'imp-tags-1',
        mode: canonicalMode,
        tags: [{ key: tagId, name: 'Alpha', color: '#fff', metadata: null }],
        roles: [
          {
            key: 'viewer',
            name: 'Viewer',
            description: null,
            groups: [],
            permissions: [],
            tags: [tagId],
            primaryTag: null,
            metadata: null,
          },
        ],
        users: [
          {
            key: { value: userId, findBy: CdmFindBy.Id },
            name: 'Member',
            roles: ['viewer'],
            groups: [],
            permissions: [],
            tags: [tagId],
            primaryTag: null,
            apiKeys: [
              {
                key: 'k1',
                clientSecret: 'x'.repeat(32),
                name: 'Bot',
                clientId: null,
                description: null,
                expiresAt: null,
                metadata: null,
              },
            ],
            metadata: null,
          },
        ],
      });

    expect(res.status).toBe(202);
    expect(startProjectPermissionsSync).toHaveBeenCalledTimes(1);
    expect(startProjectPermissionsSync.mock.calls[0][0]).toMatchObject({
      id: projectId,
      enqueuedById: userId,
      input: {
        version: 1,
        id: 'imp-tags-1',
        mode: canonicalMode,
        tags: [expect.objectContaining({ key: tagId, name: 'Alpha' })],
        roles: [
          expect.objectContaining({
            key: 'viewer',
            tags: [tagId],
          }),
        ],
        users: [
          expect.objectContaining({
            key: { value: userId, findBy: CdmFindBy.Id },
            tags: [tagId],
            apiKeys: [expect.objectContaining({ key: 'k1', name: 'Bot' })],
          }),
        ],
      },
    });
  });

  it('GET /permissions/export accepts `tags` as an exportable section', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/permissions/export`)
      .query({
        scopeId: `${accountId}:${projectId}`,
        tenant: 'accountProject',
        sections: ['tags', 'roles'],
      });

    expect(res.status).toBe(200);
    expect(exportProjectPermissions).toHaveBeenCalledWith(
      expect.objectContaining({
        id: projectId,
        sections: ['tags', 'roles'],
      })
    );
  });

  it('POST /sync-jobs returns 400 when body is invalid', async () => {
    const res = await request(app).post(`/api/projects/${projectId}/permissions/sync-jobs`).send({
      version: 1,
    });

    expect(res.status).toBe(400);
    expect(startProjectPermissionsSync).not.toHaveBeenCalled();
  });

  it('GET /sync-jobs/:jobId returns the polled job status', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/permissions/sync-jobs/${jobId}`)
      .query({ scopeId: `${accountId}:${projectId}`, tenant: 'accountProject' });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: jobId, status: 'COMPLETED' });
    expect(getProjectPermissionsSyncJob).toHaveBeenCalledWith({
      id: projectId,
      jobId,
      scope: { id: `${accountId}:${projectId}`, tenant: 'accountProject' },
    });
  });

  it('DELETE /sync-jobs/:jobId cancels the job', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}/permissions/sync-jobs/${jobId}`)
      .query({ scopeId: `${accountId}:${projectId}`, tenant: 'accountProject' });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: jobId, status: 'CANCELLED' });
    expect(cancelProjectPermissionsSync).toHaveBeenCalledWith({
      id: projectId,
      jobId,
      scope: { id: `${accountId}:${projectId}`, tenant: 'accountProject' },
    });
  });

  it('GET /sync-jobs returns the paginated list', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/permissions/sync-jobs`)
      .query({
        scopeId: `${accountId}:${projectId}`,
        tenant: 'accountProject',
        page: '1',
        limit: '20',
        sortField: 'enqueuedAt',
        sortOrder: 'DESC',
        status: 'PENDING',
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ totalCount: 2, hasNextPage: false });
    expect(res.body.data.jobs).toHaveLength(2);
    expect(listProjectPermissionsSyncJobs).toHaveBeenCalledTimes(1);
    const args = listProjectPermissionsSyncJobs.mock.calls[0][0];
    expect(args).toMatchObject({
      id: projectId,
      scope: { id: `${accountId}:${projectId}`, tenant: 'accountProject' },
      sort: { field: 'enqueuedAt', order: 'DESC' },
      status: 'PENDING',
    });
    // page/limit may arrive as strings or numbers depending on the Express
    // request shape and whether zod transforms propagated through query mutation;
    // assert numerically.
    expect(Number(args.page)).toBe(1);
    expect(Number(args.limit)).toBe(20);
  });

  it('GET /sync-jobs/:jobId/payload streams the CDM JSON with attachment headers', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/permissions/sync-jobs/${jobId}/payload`)
      .query({ scopeId: `${accountId}:${projectId}`, tenant: 'accountProject' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.headers['content-disposition']).toBe('attachment; filename="cdm-imp-1.json"');
    expect(res.body).toMatchObject({
      version: 1,
      id: 'imp-1',
      roles: [],
      users: [],
    });
    expect(getProjectPermissionsSyncJobPayload).toHaveBeenCalledWith({
      id: projectId,
      jobId,
      scope: { id: `${accountId}:${projectId}`, tenant: 'accountProject' },
    });
  });

  it('GET /sync-jobs/:jobId/payload falls back to jobId in filename when payload id is null', async () => {
    getProjectPermissionsSyncJobPayload.mockResolvedValueOnce({
      payload: emptyCdm(),
      importId: null,
      cdmVersion: 1,
    });

    const res = await request(app)
      .get(`/api/projects/${projectId}/permissions/sync-jobs/${jobId}/payload`)
      .query({ scopeId: `${accountId}:${projectId}`, tenant: 'accountProject' });

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toBe(`attachment; filename="cdm-${jobId}.json"`);
  });

  it('GET /sync-jobs/:jobId/snapshot streams the rollback snapshot with attachment headers', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/permissions/sync-jobs/${jobId}/snapshot`)
      .query({ scopeId: `${accountId}:${projectId}`, tenant: 'accountProject' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.headers['content-disposition']).toBe(
      `attachment; filename="cdm-snapshot-${jobId}.json"`
    );
    expect(res.body).toMatchObject({
      version: 1,
      roles: [
        {
          key: 'role-1',
          name: 'Existing role',
        },
      ],
    });
    expect(getProjectPermissionsSyncJobSnapshot).toHaveBeenCalledWith({
      id: projectId,
      jobId,
      scope: { id: `${accountId}:${projectId}`, tenant: 'accountProject' },
    });
  });

  it('GET /permissions/export streams the project CDM export with attachment headers', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/permissions/export`)
      .query({ scopeId: `${accountId}:${projectId}`, tenant: 'accountProject' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.headers['content-disposition']).toMatch(
      new RegExp(`^attachment; filename="cdm-export-${projectId}-.+\\.json"$`)
    );
    expect(res.body).toMatchObject({
      version: 1,
      roles: [],
      users: [],
    });
    expect(exportProjectPermissions).toHaveBeenCalledWith({
      id: projectId,
      scope: { id: `${accountId}:${projectId}`, tenant: 'accountProject' },
      version: null,
      sections: undefined,
    });
  });

  it('GET /permissions/export forwards a numeric version query param to the handler', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/permissions/export`)
      .query({
        scopeId: `${accountId}:${projectId}`,
        tenant: 'accountProject',
        version: '1',
      });

    expect(res.status).toBe(200);
    expect(exportProjectPermissions).toHaveBeenCalledTimes(1);
    const args = exportProjectPermissions.mock.calls[0][0];
    expect(args).toMatchObject({
      id: projectId,
      scope: { id: `${accountId}:${projectId}`, tenant: 'accountProject' },
    });
    /**
     * `version` may arrive as a string or a number depending on whether
     * zod transforms propagated through Express 5's `req.query` mutation
     * (same caveat as the pagination test above). Either way the handler
     * coerces and the route accepts the value, so assert numerically.
     */
    expect(Number(args.version)).toBe(1);
  });

  it('GET /permissions/export passes sections to the handler when provided', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/permissions/export`)
      .query({
        scopeId: `${accountId}:${projectId}`,
        tenant: 'accountProject',
        sections: ['roles', 'users'],
      });

    expect(res.status).toBe(200);
    expect(exportProjectPermissions).toHaveBeenCalledWith(
      expect.objectContaining({
        id: projectId,
        sections: ['roles', 'users'],
      })
    );
  });

  it('GET /permissions/export returns 400 when permissions is requested without resources', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/permissions/export`)
      .query({
        scopeId: `${accountId}:${projectId}`,
        tenant: 'accountProject',
        /** Repeat `sections=` so both tokens are present (comma-only string can collapse in query parsing). */
        sections: ['permissions'],
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('BAD_USER_INPUT');
    /** Handler runs and fails inside section validation — vi.fn still records the invocation. */
    expect(exportProjectPermissions).toHaveBeenCalledTimes(1);
    const exportArg = exportProjectPermissions.mock.calls[0][0] as {
      sections?: string | readonly string[];
    };
    const normalized =
      exportArg.sections == null
        ? []
        : Array.isArray(exportArg.sections)
          ? [...exportArg.sections]
          : [exportArg.sections];
    expect(normalized).toEqual(['permissions']);
  });
});
