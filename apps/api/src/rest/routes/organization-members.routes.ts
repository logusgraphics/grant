import { Router } from 'express';

import { validate } from '@/middleware/validation.middleware';
import { OrganizationMembersController } from '@/rest/controllers/organization-members.controller';
import { getOrganizationMembersQuerySchema } from '@/rest/schemas/organization-members.schemas';
import { TypedRequest } from '@/rest/types';
import { RequestContext } from '@/types';

export function createOrganizationMembersRoutes(context: RequestContext) {
  const router = Router();
  const controller = new OrganizationMembersController(context);

  /**
   * GET /api/organization-members
   * List organization members (unified users and invitations) with pagination, search, and sorting
   */
  router.get('/', validate({ query: getOrganizationMembersQuerySchema }), (req, res) =>
    controller.getOrganizationMembers(
      req as TypedRequest<{ query: typeof getOrganizationMembersQuerySchema }>,
      res
    )
  );

  return router;
}
