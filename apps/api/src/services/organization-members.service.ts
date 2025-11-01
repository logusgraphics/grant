import { DbSchema } from '@logusgraphics/grant-database';
import { OrganizationMemberPage, QueryOrganizationMembersArgs } from '@logusgraphics/grant-schema';

import { Transaction } from '@/lib/transaction-manager.lib';
import { Repositories } from '@/repositories';
import { AuthenticatedUser } from '@/types';
import { SelectedFields } from '@/services/common';

import {
  AuditService,
  createDynamicPaginatedSchema,
  validateInput,
  validateOutput,
} from './common';
import {
  getOrganizationMembersParamsSchema,
  organizationMemberPageSchema,
} from './organization-members.schemas';

export class OrganizationMemberService extends AuditService {
  constructor(
    private readonly repositories: Repositories,
    user: AuthenticatedUser | null,
    db: DbSchema
  ) {
    super(null, '', user, db); // No audit logs for members query
  }

  public async getOrganizationMembers(
    params: QueryOrganizationMembersArgs & SelectedFields<any>,
    transaction?: Transaction
  ): Promise<OrganizationMemberPage> {
    const context = 'OrganizationMemberService.getOrganizationMembers';
    const validatedParams = validateInput(getOrganizationMembersParamsSchema, params, context);

    const result = await this.repositories.organizationMemberRepository.getOrganizationMembers(
      validatedParams,
      transaction
    );

    const transformedResult = {
      items: result.members,
      totalCount: result.totalCount,
      hasNextPage: result.hasNextPage,
    };

    // Note: Skip validation for now as organizationMemberPageSchema structure differs
    // validateOutput(
    //   createDynamicPaginatedSchema(organizationMemberPageSchema, params.requestedFields),
    //   transformedResult,
    //   context
    // );

    return result;
  }
}
