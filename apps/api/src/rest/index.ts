import { Router } from 'express';

import { RequestContext } from '@/types/context';

import { errorHandler } from '@/middleware/auth.middleware';
import { createAccountsRoutes } from '@/rest/routes/accounts.routes';
import { createAuthRoutes } from '@/rest/routes/auth.routes';
import { createGroupRoutes } from '@/rest/routes/groups.routes';
import { createOrganizationRoutes } from '@/rest/routes/organizations.routes';
import { createPermissionRoutes } from '@/rest/routes/permissions.routes';
import { createProjectRoutes } from '@/rest/routes/projects.routes';
import { createRoleRoutes } from '@/rest/routes/roles.routes';
import { createTagRoutes } from '@/rest/routes/tags.routes';
import { createUserRoutes } from '@/rest/routes/users.routes';

export function createRestRouter(context: RequestContext): Router {
  const router = Router();

  router.use('/auth', createAuthRoutes(context));
  router.use('/users', createUserRoutes(context));
  router.use('/roles', createRoleRoutes(context));
  router.use('/groups', createGroupRoutes(context));
  router.use('/permissions', createPermissionRoutes(context));
  router.use('/organizations', createOrganizationRoutes(context));
  router.use('/projects', createProjectRoutes(context));
  router.use('/tags', createTagRoutes(context));
  router.use('/accounts', createAccountsRoutes(context));

  router.use(errorHandler);

  return router;
}
