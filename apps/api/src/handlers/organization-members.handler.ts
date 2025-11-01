import { DbSchema } from '@logusgraphics/grant-database';
import { OrganizationMemberPage, QueryOrganizationMembersArgs } from '@logusgraphics/grant-schema';

import { createModuleLogger } from '@/lib/logger';
import { Services } from '@/services';

export class OrganizationMembersHandler {
  private readonly logger = createModuleLogger('OrganizationMembersHandler');

  constructor(readonly services: Services) {}

  /**
   * Get organization members (unified users and invitations)
   */
  public async getOrganizationMembers(
    params: QueryOrganizationMembersArgs
  ): Promise<OrganizationMemberPage> {
    return await this.services.organizationMembers.getOrganizationMembers(params);
  }
}
