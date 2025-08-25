import { RoleGroup } from '@/graphql/generated/types';
import {
  PivotRepository,
  BasePivotQueryArgs,
  BasePivotAddArgs,
  BasePivotRemoveArgs,
} from '@/graphql/repositories/common';

import { IRoleGroupRepository } from './interface';
import { roleGroups, RoleGroupModel } from './schema';

export class RoleGroupRepository
  extends PivotRepository<RoleGroupModel, RoleGroup>
  implements IRoleGroupRepository
{
  protected table = roleGroups;
  protected parentIdField: keyof RoleGroupModel = 'roleId';
  protected relatedIdField: keyof RoleGroupModel = 'groupId';

  protected toEntity(dbRoleGroup: RoleGroupModel): RoleGroup {
    return {
      id: dbRoleGroup.id,
      roleId: dbRoleGroup.roleId,
      groupId: dbRoleGroup.groupId,
      createdAt: dbRoleGroup.createdAt,
      updatedAt: dbRoleGroup.updatedAt,
      deletedAt: dbRoleGroup.deletedAt,
    };
  }

  public async getRoleGroups(params: { roleId: string }): Promise<RoleGroup[]> {
    const baseParams: BasePivotQueryArgs = {
      parentId: params.roleId,
    };

    return this.query(baseParams);
  }

  public async addRoleGroup(roleId: string, groupId: string): Promise<RoleGroup> {
    const baseParams: BasePivotAddArgs = {
      parentId: roleId,
      relatedId: groupId,
    };

    const roleGroup = await this.add(baseParams);

    return roleGroup;
  }

  public async softDeleteRoleGroup(roleId: string, groupId: string): Promise<RoleGroup> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: roleId,
      relatedId: groupId,
    };

    const roleGroup = await this.softDelete(baseParams);

    return roleGroup;
  }

  public async hardDeleteRoleGroup(roleId: string, groupId: string): Promise<RoleGroup> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: roleId,
      relatedId: groupId,
    };

    const roleGroup = await this.hardDelete(baseParams);

    return roleGroup;
  }
}
