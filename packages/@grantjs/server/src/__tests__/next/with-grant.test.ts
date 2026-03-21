import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GrantClient } from '../../grant-client';
import { withGrant } from '../../next/with-grant';

/**
 * Minimal NextRequest-like shape (headers with get() for Web API style).
 */
function createMockRequest(overrides: { authorization?: string } = {}): {
  headers: { get: (name: string) => string | null };
  url?: string;
} {
  return {
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'authorization'
          ? (overrides.authorization ?? 'Bearer test-token')
          : null,
    },
    url: 'https://example.com/api/documents',
  };
}

describe('withGrant (Next.js)', () => {
  let client: GrantClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    global.fetch = mockFetch = vi.fn();
    mockFetch.mockReset();

    client = new GrantClient({
      apiUrl: 'https://api.example.com',
      getToken: (request) => {
        const req = request as { headers?: { get: (n: string) => string | null } };
        const auth = req.headers?.get?.('authorization');
        return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
      },
    });
  });

  it('should call handler with authorization context when authorized', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { authorized: true, matchedPermission: { id: 'p1' } },
        }),
    });

    const handler = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [] })));
    const wrapped = withGrant(client, { resource: 'Document', action: 'Query' }, handler);

    const request = createMockRequest();
    const response = await wrapped(request as NextRequest);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledWith(request, {
      authorization: { authorized: true, matchedPermission: { id: 'p1' } },
    });
  });

  it('should return 401 when no token', async () => {
    const handler = vi.fn();
    const wrapped = withGrant(client, { resource: 'Document', action: 'Query' }, handler);

    const request = createMockRequest({ authorization: '' });
    const response = await wrapped(request as NextRequest);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: 'Unauthorized', code: 'UNAUTHENTICATED' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('should return 403 when not authorized', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { authorized: false, reason: 'NoPermission' },
        }),
    });

    const handler = vi.fn();
    const wrapped = withGrant(client, { resource: 'Document', action: 'Delete' }, handler);

    const request = createMockRequest();
    const response = await wrapped(request as NextRequest);

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toEqual({ error: 'Forbidden', code: 'FORBIDDEN', reason: 'NoPermission' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('should use resource resolver when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { authorized: true } }),
    });

    const resourceResolver = vi.fn().mockResolvedValue({ id: 'doc-123', ownerId: 'user-1' });
    const handler = vi.fn().mockResolvedValue(new Response());
    const wrapped = withGrant(
      client,
      {
        resource: 'Document',
        action: 'Update',
        resourceResolver,
      },
      handler
    );

    const request = createMockRequest();
    await wrapped(request as NextRequest);

    expect(resourceResolver).toHaveBeenCalledWith({
      resourceSlug: 'Document',
      request,
    });
    expect(handler).toHaveBeenCalled();
  });

  it('should return 404 when resource resolver returns null', async () => {
    const resourceResolver = vi.fn().mockResolvedValue(null);
    const handler = vi.fn();
    const wrapped = withGrant(
      client,
      {
        resource: 'Document',
        action: 'Update',
        resourceResolver,
      },
      handler
    );

    const request = createMockRequest();
    const response = await wrapped(request as NextRequest);

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: 'Resource not found', code: 'NOT_FOUND' });
    expect(handler).not.toHaveBeenCalled();
  });
});
