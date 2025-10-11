import { Router } from 'express';

import { validate } from '@/middleware/validation.middleware';
import { AccountsController } from '@/rest/controllers/accounts.controller';
import { accountParamsSchema, getAccountsQuerySchema } from '@/rest/schemas/accounts.schemas';
import { TypedRequest } from '@/rest/types';
import { RequestContext } from '@/types';

export function createAccountsRoutes(context: RequestContext) {
  const router = Router();
  const accountsController = new AccountsController(context);

  /**
   * GET /api/accounts
   * List accounts with optional filtering and relations
   */
  router.get('/', validate({ query: getAccountsQuerySchema }), (req, res) =>
    accountsController.getAccounts(
      req as TypedRequest<{ query: typeof getAccountsQuerySchema }>,
      res
    )
  );

  /**
   * GET /api/accounts/:id
   * Get a single account by ID with optional relations
   */
  router.get(
    '/:id',
    validate({ params: accountParamsSchema, query: getAccountsQuerySchema }),
    (req, res) =>
      accountsController.getAccount(
        req as TypedRequest<{
          params: typeof accountParamsSchema;
          query: typeof getAccountsQuerySchema;
        }>,
        res
      )
  );

  return router;
}
