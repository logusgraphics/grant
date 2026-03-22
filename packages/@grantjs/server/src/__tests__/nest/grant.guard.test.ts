import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GrantClient } from '../../grant-client';
import { GrantGuard } from '../../nest/grant.guard';

function createMockContext(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
    getArgs: () => [],
    getArgByIndex: () => ({}),
    switchToRpc: () => ({}),
    switchToWs: () => ({}),
    getType: () => 'http',
  } as ExecutionContext;
}

describe('GrantGuard (NestJS)', () => {
  let client: GrantClient;
  let mockFetch: ReturnType<typeof vi.fn>;
  let mockRequest: { headers?: { authorization?: string } };

  beforeEach(() => {
    global.fetch = mockFetch = vi.fn();
    mockFetch.mockReset();

    client = new GrantClient({
      apiUrl: 'https://api.example.com',
      getToken: (request) => {
        const req = request as { headers?: { authorization?: string } };
        return req.headers?.authorization?.replace('Bearer ', '') ?? null;
      },
    });

    mockRequest = {
      headers: { authorization: 'Bearer test-token' },
    };
  });

  it('should return true and attach authorization when authorized', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { authorized: true, matchedPermission: { id: 'p1' } },
        }),
    });

    const guard = new GrantGuard(client, { resource: 'Document', action: 'Query' });
    const context = createMockContext(mockRequest);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect((mockRequest as { authorization?: unknown }).authorization).toEqual({
      authorized: true,
      matchedPermission: { id: 'p1' },
    });
  });

  it('should throw UnauthorizedException when no token', async () => {
    mockRequest.headers = {};

    const guard = new GrantGuard(client, { resource: 'Document', action: 'Query' });
    const context = createMockContext(mockRequest);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { error: 'Unauthorized', code: 'UNAUTHENTICATED' },
    });
  });

  it('should throw ForbiddenException when not authorized', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { authorized: false, reason: 'NoPermission' },
        }),
    });

    const guard = new GrantGuard(client, { resource: 'Document', action: 'Delete' });
    const context = createMockContext(mockRequest);

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { error: 'Forbidden', code: 'FORBIDDEN', reason: 'NoPermission' },
    });
  });

  it('should use resource resolver when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { authorized: true } }),
    });

    const resourceResolver = vi.fn().mockResolvedValue({ id: 'doc-123', ownerId: 'user-1' });
    const guard = new GrantGuard(client, {
      resource: 'Document',
      action: 'Update',
      resourceResolver,
    });
    const context = createMockContext(mockRequest);

    const result = await guard.canActivate(context);

    expect(resourceResolver).toHaveBeenCalledWith({
      resourceSlug: 'Document',
      request: mockRequest,
    });
    expect(result).toBe(true);
  });

  it('should throw NotFoundException when resource resolver returns null', async () => {
    const resourceResolver = vi.fn().mockResolvedValue(null);
    const guard = new GrantGuard(client, {
      resource: 'Document',
      action: 'Update',
      resourceResolver,
    });
    const context = createMockContext(mockRequest);

    await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { error: 'Resource not found', code: 'NOT_FOUND' },
    });
  });

  it('should throw ForbiddenException when options missing (no explicit options and no metadata)', async () => {
    const guard = new GrantGuard(client);
    const context = createMockContext(mockRequest);

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(context)).rejects.toThrow(/Grant options.*required/);
  });
});
