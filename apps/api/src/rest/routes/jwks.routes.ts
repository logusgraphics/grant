import { Tenant } from '@grantjs/schema';
import { Request, Response, Router } from 'express';
import { z } from 'zod';

import { config } from '@/config';
import { getJwks, getJwksRetentionCutoff } from '@/lib/jwks.lib';
import { logger } from '@/lib/logger';
import { ContextRequest } from '@/types';

const uuidParam = z.string().uuid();

function sendJwksResponse(res: Response, keys: Array<{ kid: string; publicKeyPem: string }>): void {
  const jwks = getJwks({
    projectKeys: keys,
    onKeyError: config.app.isDevelopment
      ? (kid, err) => logger.warn({ kid, err }, 'JWKS: failed to add key')
      : undefined,
  });
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', `public, max-age=${config.jwt.jwksMaxAgeSeconds}`);
  res.json(jwks);
}

/**
 * JWKS router. Mount with app.use(createJwksRouter()).
 * Requires contextMiddleware so req.context.grant is set.
 *
 * - GET /.well-known/jwks.json — system (session) keys; iss = API base URL
 * - GET /org/:orgId/prj/:projectId/.well-known/jwks.json — organization-project keys
 * - GET /acc/:accId/prj/:projectId/.well-known/jwks.json — account-project keys
 *
 * Returns 404 when scope has no keys (or invalid UUIDs for scope routes).
 */
export function createJwksRouter(): Router {
  const router = Router();
  const retentionCutoff = getJwksRetentionCutoff(config.jwt.refreshTokenExpirationDays);

  router.get('/.well-known/jwks.json', async (req: Request, res: Response) => {
    const { grant } = (req as ContextRequest).context;
    const keys = await grant.getPublicKeysForJwks(null, retentionCutoff);
    sendJwksResponse(res, keys);
  });

  router.get(
    '/org/:orgId/prj/:projectId/.well-known/jwks.json',
    async (req: Request, res: Response) => {
      const orgId = uuidParam.safeParse(req.params.orgId);
      const projectId = uuidParam.safeParse(req.params.projectId);
      if (!orgId.success || !projectId.success) {
        res.status(404).end();
        return;
      }
      const scope = { tenant: Tenant.OrganizationProject, id: `${orgId.data}:${projectId.data}` };
      const { grant } = (req as ContextRequest).context;
      const keys = await grant.getPublicKeysForJwks(scope, retentionCutoff);
      if (keys.length === 0) {
        res.status(404).end();
        return;
      }
      sendJwksResponse(res, keys);
    }
  );

  router.get(
    '/acc/:accId/prj/:projectId/.well-known/jwks.json',
    async (req: Request, res: Response) => {
      const accId = uuidParam.safeParse(req.params.accId);
      const projectId = uuidParam.safeParse(req.params.projectId);
      if (!accId.success || !projectId.success) {
        res.status(404).end();
        return;
      }
      const scope = { tenant: Tenant.AccountProject, id: `${accId.data}:${projectId.data}` };
      const { grant } = (req as ContextRequest).context;
      const keys = await grant.getPublicKeysForJwks(scope, retentionCutoff);
      if (keys.length === 0) {
        res.status(404).end();
        return;
      }
      sendJwksResponse(res, keys);
    }
  );

  return router;
}
