import {
  PivotRepository,
  BasePivotQueryArgs,
  BasePivotAddArgs,
  BasePivotRemoveArgs,
} from '../common/PivotRepository';

import { OrganizationGroup, organizationGroups } from './schema';

export class OrganizationGroupRepository extends PivotRepository<
  OrganizationGroup,
  OrganizationGroup
> {
  protected table = organizationGroups;
  protected parentIdField: keyof OrganizationGroup = 'organizationId';
  protected relatedIdField: keyof OrganizationGroup = 'groupId';

  protected toEntity(dbOrganizationGroup: OrganizationGroup): OrganizationGroup {
    return dbOrganizationGroup;
  }

  public async getOrganizationGroups(params: {
    organizationId?: string;
    groupId?: string;
  }): Promise<OrganizationGroup[]> {
    if (params.organizationId) {
      const baseParams: BasePivotQueryArgs = {
        parentId: params.organizationId,
      };
      return this.query(baseParams);
    }

    // For groupId queries or general queries, we'll need to implement custom logic
    // For now, return empty array - this can be enhanced later if needed
    return [];
  }

  public async addOrganizationGroup(
    organizationId: string,
    groupId: string
  ): Promise<OrganizationGroup> {
    const baseParams: BasePivotAddArgs = {
      parentId: organizationId,
      relatedId: groupId,
    };

    const organizationGroup = await this.add(baseParams);
    return organizationGroup;
  }

  public async softDeleteOrganizationGroup(
    organizationId: string,
    groupId: string
  ): Promise<OrganizationGroup | null> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: organizationId,
      relatedId: groupId,
    };

    const organizationGroup = await this.softDelete(baseParams);
    return organizationGroup;
  }

  public async hardDeleteOrganizationGroup(
    organizationId: string,
    groupId: string
  ): Promise<OrganizationGroup | null> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: organizationId,
      relatedId: groupId,
    };

    const organizationGroup = await this.hardDelete(baseParams);
    return organizationGroup;
  }
}
