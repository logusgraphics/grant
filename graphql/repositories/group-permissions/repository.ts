import {
  MutationAddGroupPermissionArgs,
  MutationRemoveGroupPermissionArgs,
  GroupPermission,
} from '@/graphql/generated/types';
import {
  PivotRepository,
  BasePivotQueryArgs,
  BasePivotAddArgs,
  BasePivotRemoveArgs,
} from '@/graphql/repositories/common';

import { IGroupPermissionRepository } from './interface';
import { groupPermissions, GroupPermissionModel } from './schema';

export class GroupPermissionRepository
  extends PivotRepository<GroupPermissionModel, GroupPermission>
  implements IGroupPermissionRepository
{
  protected table = groupPermissions;
  protected parentIdField: keyof GroupPermissionModel = 'groupId';
  protected relatedIdField: keyof GroupPermissionModel = 'permissionId';

  protected toEntity(dbGroupPermission: GroupPermissionModel): GroupPermission {
    return {
      id: dbGroupPermission.id,
      groupId: dbGroupPermission.groupId,
      permissionId: dbGroupPermission.permissionId,
      createdAt: dbGroupPermission.createdAt,
      updatedAt: dbGroupPermission.updatedAt,
      deletedAt: dbGroupPermission.deletedAt,
    };
  }

  public async getGroupPermissions(params: { groupId: string }): Promise<GroupPermission[]> {
    const baseParams: BasePivotQueryArgs = {
      parentId: params.groupId,
    };

    return this.query(baseParams);
  }

  public async addGroupPermission(
    params: MutationAddGroupPermissionArgs
  ): Promise<GroupPermission> {
    const baseParams: BasePivotAddArgs = {
      parentId: params.input.groupId,
      relatedId: params.input.permissionId,
    };

    const groupPermission = await this.add(baseParams);

    return groupPermission;
  }

  public async softDeleteGroupPermission(
    params: MutationRemoveGroupPermissionArgs
  ): Promise<GroupPermission> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: params.input.groupId,
      relatedId: params.input.permissionId,
    };

    const groupPermission = await this.softDelete(baseParams);

    return groupPermission;
  }

  public async hardDeleteGroupPermission(
    params: MutationRemoveGroupPermissionArgs
  ): Promise<GroupPermission> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: params.input.groupId,
      relatedId: params.input.permissionId,
    };

    const groupPermission = await this.hardDelete(baseParams);

    return groupPermission;
  }
}
