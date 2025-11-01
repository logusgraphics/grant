import {
  OrganizationInvitationStatus,
  QueryOrganizationMembersArgs,
  SortOrder,
} from '@logusgraphics/grant-schema';
import { Response } from 'express';

import { TypedRequest } from '@/rest/types';
import { RequestContext } from '@/types';

import { getOrganizationMembersQuerySchema } from '../schemas/organization-members.schemas';

import { BaseController } from './base.controller';

/**
 * Controller for organization members REST endpoints
 */
export class OrganizationMembersController extends BaseController {
  constructor(context: RequestContext) {
    super(context);
  }

  /**
   * GET /api/organization-members
   * List organization members (unified users and invitations) with pagination, search, and sorting
   */
  async getOrganizationMembers(
    req: TypedRequest<{ query: typeof getOrganizationMembersQuerySchema }>,
    res: Response
  ) {
    const { organizationId, status, page, limit, search, sortField, sortOrder } = req.query;

    const params = {
      organizationId,
      status: status as OrganizationInvitationStatus | undefined,
      page: page ?? undefined,
      limit: limit ?? undefined,
      search: search ?? undefined,
      sort:
        sortField && sortOrder
          ? {
              field: sortField,
              order: sortOrder.toUpperCase() as SortOrder,
            }
          : undefined,
    } as QueryOrganizationMembersArgs;

    const result = await this.context.handlers.organizationMembers.getOrganizationMembers(params);

    return this.success(res, {
      items: result.members,
      totalCount: result.totalCount,
      hasNextPage: result.hasNextPage,
    });
  }
}
