import { OrganizationGroup } from './schema';

export interface IOrganizationGroupRepository {
  getOrganizationGroups(params: {
    organizationId?: string;
    groupId?: string;
  }): Promise<OrganizationGroup[]>;
  addOrganizationGroup(organizationId: string, groupId: string): Promise<OrganizationGroup>;
  softDeleteOrganizationGroup(
    organizationId: string,
    groupId: string
  ): Promise<OrganizationGroup | null>;
  hardDeleteOrganizationGroup(
    organizationId: string,
    groupId: string
  ): Promise<OrganizationGroup | null>;
}
