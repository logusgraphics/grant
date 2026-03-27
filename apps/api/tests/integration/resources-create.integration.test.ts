/**
 * Integration: POST /api/resources returns embedded `permissions` when the handler includes them.
 *
 * Mocks email/MFA/RBAC middleware to next(); exercises validation, router, and success JSON shape.
 */
import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createResourcesRouter } from '@/rest/routes/resources.routes';
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

const orgId = '00000000-0000-4000-8000-000000000010';
const projectId = '00000000-0000-4000-8000-000000000011';
const resourceId = '00000000-0000-4000-8000-000000000001';

describe('resources create REST integration', () => {
  let app: express.Express;
  let createResource: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    createResource = vi.fn().mockResolvedValue({
      id: resourceId,
      name: 'Integration Resource',
      slug: 'int-res',
      description: null,
      actions: ['read', 'write'],
      isActive: true,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      deletedAt: null,
      permissions: [
        {
          id: '00000000-0000-4000-8000-0000000000a1',
          name: 'Integration Resource: read',
          description: 'd1',
          action: 'read',
          resourceId,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          deletedAt: null,
        },
        {
          id: '00000000-0000-4000-8000-0000000000a2',
          name: 'Integration Resource: write',
          description: 'd2',
          action: 'write',
          resourceId,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          deletedAt: null,
        },
      ],
    });

    const mockContext: RequestContext = {
      grant: {} as RequestContext['grant'],
      user: null,
      handlers: {
        resources: { createResource },
      } as unknown as RequestContext['handlers'],
      resourceResolvers: {} as RequestContext['resourceResolvers'],
      requestLogger: noopLogger as RequestContext['requestLogger'],
      origin: 'https://api.example.com',
      requestBaseUrl: 'https://api.example.com',
      locale: 'en',
      userAgent: null,
      ipAddress: null,
    };

    app = express();
    app.use(express.json());
    app.use('/api/resources', createResourcesRouter(mockContext));
  });

  it('201 success body includes data.permissions when handler returns them', async () => {
    const res = await request(app)
      .post('/api/resources')
      .send({
        name: 'Integration Resource',
        slug: 'int-res',
        scope: { tenant: 'organizationProject', id: `${orgId}:${projectId}` },
        createPermissions: true,
        actions: ['read', 'write'],
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true });
    expect(res.body.data.permissions).toHaveLength(2);
    expect(res.body.data.permissions.map((p: { action: string }) => p.action).sort()).toEqual([
      'read',
      'write',
    ]);
    expect(
      res.body.data.permissions.every((p: { resourceId: string }) => p.resourceId === resourceId)
    ).toBe(true);
    expect(createResource).toHaveBeenCalledTimes(1);
  });
});
