import {
  MutationAddUserRoleArgs,
  MutationRemoveUserRoleArgs,
  UserRole,
} from '@/graphql/generated/types';
import {
  PivotRepository,
  BasePivotQueryArgs,
  BasePivotAddArgs,
  BasePivotRemoveArgs,
} from '@/graphql/repositories/common';

import { userRoles, UserRoleModel } from './schema';

export class UserRoleRepository extends PivotRepository<UserRoleModel, UserRole> {
  protected table = userRoles;
  protected parentIdField: keyof UserRoleModel = 'userId';
  protected relatedIdField: keyof UserRoleModel = 'roleId';

  protected toEntity(dbUserRole: UserRoleModel): UserRole {
    return {
      id: dbUserRole.id,
      userId: dbUserRole.userId,
      roleId: dbUserRole.roleId,
      createdAt: dbUserRole.createdAt,
      updatedAt: dbUserRole.updatedAt,
      deletedAt: dbUserRole.deletedAt,
    };
  }

  public async getUserRoles(params: { userId: string }): Promise<UserRole[]> {
    const baseParams: BasePivotQueryArgs = {
      parentId: params.userId,
    };

    return this.query(baseParams);
  }

  public async addUserRole(params: MutationAddUserRoleArgs): Promise<UserRole> {
    const baseParams: BasePivotAddArgs = {
      parentId: params.input.userId,
      relatedId: params.input.roleId,
    };

    const userRole = await this.add(baseParams);

    return userRole;
  }

  public async softDeleteUserRole(params: MutationRemoveUserRoleArgs): Promise<UserRole> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: params.input.userId,
      relatedId: params.input.roleId,
    };

    const userRole = await this.softDelete(baseParams);

    return userRole;
  }

  public async hardDeleteUserRole(params: MutationRemoveUserRoleArgs): Promise<UserRole> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: params.input.userId,
      relatedId: params.input.roleId,
    };

    const userRole = await this.hardDelete(baseParams);

    return userRole;
  }
}
