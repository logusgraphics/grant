import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type AuthorizedFastifyRequest, grant, grantPlugin } from '../../fastify/plugin';
import { GrantClient } from '../../grant-client';

describe('Fastify Grant Plugin', () => {
  let client: GrantClient;
  let mockFetch: ReturnType<typeof vi.fn>;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockFastify: Partial<FastifyInstance>;

  beforeEach(() => {
    global.fetch = mockFetch = vi.fn();
    mockFetch.mockReset();

    client = new GrantClient({
      apiUrl: 'https://api.example.com',
      getToken: (request) => {
        const req = request as { headers?: { authorization?: string } };
        return req.headers?.authorization?.replace('Bearer ', '') || null;
      },
    });

    mockRequest = {
      headers: {
        authorization: 'Bearer test-token',
      },
      query: {},
    };

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    mockFastify = {
      decorate: vi.fn(),
    };
  });

  describe('grantPlugin', () => {
    it('should decorate Fastify instance with GrantClient', async () => {
      await grantPlugin(mockFastify as FastifyInstance, {
        apiUrl: 'https://api.example.com',
      });

      expect(mockFastify.decorate).toHaveBeenCalledWith('grant', expect.any(GrantClient));
    });
  });

  describe('grant preHandler', () => {
    it('should call next when authorized', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { authorized: true } }),
      });

      const preHandler = grant(client, {
        resource: 'Organization',
        action: 'Query',
      });

      await preHandler(mockRequest as AuthorizedFastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).not.toHaveBeenCalled();
      expect((mockRequest as AuthorizedFastifyRequest).authorization).toBeDefined();
    });

    it('should return 401 when no token is present', async () => {
      const requestWithoutToken = {
        ...mockRequest,
        headers: {},
      };

      const preHandler = grant(client, {
        resource: 'Organization',
        action: 'Query',
      });

      await preHandler(requestWithoutToken as AuthorizedFastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Unauthorized',
        code: 'UNAUTHENTICATED',
      });
    });

    it('should return 403 when not authorized', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { authorized: false, reason: 'Insufficient permissions' },
          }),
      });

      const preHandler = grant(client, {
        resource: 'Organization',
        action: 'Delete',
      });

      await preHandler(mockRequest as AuthorizedFastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Forbidden',
        code: 'FORBIDDEN',
        reason: 'Insufficient permissions',
      });
    });

    it('should use resource resolver when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { authorized: true } }),
      });

      const resourceResolver = vi.fn().mockResolvedValue({
        id: 'project-123',
        ownerId: 'user-456',
      });

      const preHandler = grant(client, {
        resource: 'Project',
        action: 'Update',
        resourceResolver,
      });

      await preHandler(mockRequest as AuthorizedFastifyRequest, mockReply as FastifyReply);

      expect(resourceResolver).toHaveBeenCalledWith({
        resourceSlug: 'Project',
        request: mockRequest,
      });
    });

    it('should return 404 when resource resolver returns null', async () => {
      const resourceResolver = vi.fn().mockResolvedValue(null);

      const preHandler = grant(client, {
        resource: 'Project',
        action: 'Update',
        resourceResolver,
      });

      await preHandler(mockRequest as AuthorizedFastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Resource not found',
        code: 'NOT_FOUND',
      });
    });

    it('should attach authorization result to request', async () => {
      const authResult = { authorized: true, matchedPermission: undefined };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: authResult }),
      });

      const preHandler = grant(client, {
        resource: 'Organization',
        action: 'Query',
      });

      await preHandler(mockRequest as AuthorizedFastifyRequest, mockReply as FastifyReply);

      expect((mockRequest as AuthorizedFastifyRequest).authorization).toEqual(authResult);
    });
  });
});
