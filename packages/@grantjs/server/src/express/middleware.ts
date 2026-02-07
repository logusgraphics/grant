import { AuthenticationError, AuthorizationError, BadRequestError, NotFoundError } from '../errors';
import { GrantClient } from '../grant-client';
import { debugGrant } from '../utils/debug';
import { extractTokenFromRequest } from '../utils/token-extractor';

import type { ResourceResolver, AuthorizationResult } from '../types';
import type { Request, Response, NextFunction } from 'express';

/**
 * Extended Express Request with authorization result
 */
export interface AuthorizedRequest extends Request {
  authorization?: AuthorizationResult;
}

/**
 * Options for Express middleware
 */
export interface GrantOptions {
  /** The resource slug to check (e.g., "Organization", "Project", "Document") */
  resource: string;
  /** The action to check (e.g., "Query", "Create", "Update", "Delete") */
  action: string;
  /** Custom resource resolver for condition evaluation */
  resourceResolver?: ResourceResolver;
}

/**
 * Create Express middleware to check if user is granted permission
 *
 * @example
 * ```ts
 * import { grant } from '@grantjs/server/express';
 * import { GrantClient } from '@grantjs/server';
 *
 * const grantClient = new GrantClient({ apiUrl: 'https://api.grant.com' });
 *
 * router.get('/organizations', grant(grantClient, {
 *   resource: 'Organization',
 *   action: 'Query',
 * }), handler);
 * ```
 */
export function grant(
  client: GrantClient,
  options: GrantOptions
): (req: AuthorizedRequest, res: Response, next: NextFunction) => Promise<void> {
  return async (req: AuthorizedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      debugGrant('Express', { resource: options.resource, action: options.action });

      // 1. Check authentication (token must be present)
      const token = await extractTokenFromRequest(req, client.config);
      if (!token) {
        res.status(401).json({
          error: 'Unauthorized',
          code: 'UNAUTHENTICATED',
        });
        return;
      }

      // 2. Optionally resolve resource for condition evaluation
      let resolvedResource: Record<string, unknown> | null = null;

      if (options.resourceResolver) {
        resolvedResource = await options.resourceResolver({
          resourceSlug: options.resource,
          request: req,
        });

        if (!resolvedResource) {
          res.status(404).json({
            error: 'Resource not found',
            code: 'NOT_FOUND',
          });
          return;
        }
      }

      // 3. Check authorization (pass request for token extraction; scope comes from JWT claims)
      const result = await client.isAuthorized(
        options.resource,
        options.action,
        {
          context: {
            resource: resolvedResource || undefined,
          },
        },
        req
      );

      debugGrant('Express', {
        resource: options.resource,
        action: options.action,
        authorized: result.authorized,
        ...(result.authorized ? {} : { reason: result.reason }),
      });

      if (!result.authorized) {
        res.status(403).json({
          error: 'Forbidden',
          code: 'FORBIDDEN',
          reason: result.reason,
        });
        return;
      }

      // 4. Attach authorization result to request for downstream use
      (req as AuthorizedRequest).authorization = result;

      // 5. Proceed to next middleware/handler
      next();
    } catch (error) {
      // Handle known errors
      if (error instanceof AuthenticationError) {
        res.status(401).json({
          error: error.message,
          code: error.code,
        });
        return;
      }

      if (error instanceof AuthorizationError) {
        res.status(403).json({
          error: error.message,
          code: error.code,
          reason: error.reason,
        });
        return;
      }

      if (error instanceof BadRequestError) {
        res.status(400).json({
          error: error.message,
          code: error.code,
        });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({
          error: error.message,
          code: error.code,
        });
        return;
      }

      // Unknown error - pass to Express error handler
      next(error);
    }
  };
}
