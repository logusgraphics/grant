import { ResourceAction, ResourceSlug } from '@grantjs/constants';
import { Response, Router } from 'express';

import { authorizeRestRoute, requireEmailVerificationRest } from '@/lib/authorization';
import { validate } from '@/middleware/validation.middleware';
import {
  getSigningKeysQuerySchema,
  rotateSigningKeyRequestSchema,
} from '@/rest/schemas/signing-keys.schemas';
import { TypedRequest } from '@/rest/types';
import { sendSuccessResponse } from '@/rest/utils/response';
import { RequestContext } from '@/types';

export function createSigningKeysRoutes(context: RequestContext) {
  const router = Router();

  router.get(
    '/',
    validate({ query: getSigningKeysQuerySchema }),
    requireEmailVerificationRest({ allowPersonalContext: true }),
    authorizeRestRoute({
      resource: ResourceSlug.ApiKey,
      action: ResourceAction.Query,
    }),
    async (req: TypedRequest<{ query: typeof getSigningKeysQuerySchema }>, res: Response) => {
      const { scopeId, tenant, limit } = req.query;
      const scope = { id: scopeId!, tenant: tenant! };
      const keys = await context.handlers.signingKeys.getSigningKeys(scope, { limit });
      sendSuccessResponse(res, keys);
    }
  );

  router.post(
    '/rotate',
    validate({ body: rotateSigningKeyRequestSchema }),
    requireEmailVerificationRest({ allowPersonalContext: true }),
    authorizeRestRoute({
      resource: ResourceSlug.ApiKey,
      action: ResourceAction.Query,
    }),
    async (req: TypedRequest<{ body: typeof rotateSigningKeyRequestSchema }>, res: Response) => {
      const { scope } = req.body;
      const newKey = await context.handlers.signingKeys.rotateSigningKey(scope);
      sendSuccessResponse(res, newKey, 201);
    }
  );

  return router;
}
