import {
  QueryOrganizationRolesArgs,
  MutationAddOrganizationRoleArgs,
  MutationRemoveOrganizationRoleArgs,
  OrganizationRole,
} from '@/graphql/generated/types';
import { PivotRepository } from '@/graphql/repositories/common';

import { OrganizationRoleModel, organizationRoles } from './schema';

export class OrganizationRoleRepository extends PivotRepository<
  OrganizationRoleModel,
  OrganizationRole
> {
  protected table = organizationRoles;
  protected parentIdField: keyof OrganizationRoleModel = 'organizationId';
  protected relatedIdField: keyof OrganizationRoleModel = 'roleId';

  protected toEntity(dbPivot: OrganizationRoleModel): OrganizationRole {
    return {
      id: dbPivot.id,
      organizationId: dbPivot.organizationId,
      roleId: dbPivot.roleId,
      createdAt: dbPivot.createdAt,
      updatedAt: dbPivot.updatedAt,
      deletedAt: dbPivot.deletedAt,
    };
  }

  public async getOrganizationRoles(
    params: QueryOrganizationRolesArgs
  ): Promise<OrganizationRole[]> {
    return this.query({ parentId: params.organizationId });
  }

  public async addOrganizationRole(
    params: MutationAddOrganizationRoleArgs
  ): Promise<OrganizationRole> {
    return this.add({
      parentId: params.input.organizationId,
      relatedId: params.input.roleId,
    });
  }

  public async softDeleteOrganizationRole(
    params: MutationRemoveOrganizationRoleArgs
  ): Promise<OrganizationRole> {
    return this.softDelete({
      parentId: params.input.organizationId,
      relatedId: params.input.roleId,
    });
  }

  public async hardDeleteOrganizationRole(
    params: MutationRemoveOrganizationRoleArgs
  ): Promise<OrganizationRole> {
    return this.hardDelete({
      parentId: params.input.organizationId,
      relatedId: params.input.roleId,
    });
  }
}
