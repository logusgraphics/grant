import {
  QueryRoleTagsArgs,
  MutationAddRoleTagArgs,
  MutationRemoveRoleTagArgs,
  RoleTag,
} from '@/graphql/generated/types';
import { PivotRepository } from '@/graphql/repositories/common';

import { RoleTagModel, roleTags } from './schema';

export class RoleTagRepository extends PivotRepository<RoleTagModel, RoleTag> {
  protected table = roleTags;
  protected parentIdField: keyof RoleTagModel = 'roleId';
  protected relatedIdField: keyof RoleTagModel = 'tagId';

  protected toEntity(dbPivot: RoleTagModel): RoleTag {
    return {
      id: dbPivot.id,
      roleId: dbPivot.roleId,
      tagId: dbPivot.tagId,
      createdAt: dbPivot.createdAt,
      updatedAt: dbPivot.updatedAt,
      deletedAt: dbPivot.deletedAt,
    };
  }

  public async getRoleTags(params: QueryRoleTagsArgs): Promise<RoleTag[]> {
    return this.query({ parentId: params.roleId });
  }

  public async addRoleTag(params: MutationAddRoleTagArgs): Promise<RoleTag> {
    return this.add({
      parentId: params.input.roleId,
      relatedId: params.input.tagId,
    });
  }

  public async softDeleteRoleTag(params: MutationRemoveRoleTagArgs): Promise<RoleTag> {
    return this.softDelete({
      parentId: params.input.roleId,
      relatedId: params.input.tagId,
    });
  }

  public async hardDeleteRoleTag(params: MutationRemoveRoleTagArgs): Promise<RoleTag> {
    return this.hardDelete({
      parentId: params.input.roleId,
      relatedId: params.input.tagId,
    });
  }
}
