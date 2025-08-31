import {
  QueryPermissionTagsArgs,
  MutationAddPermissionTagArgs,
  MutationRemovePermissionTagArgs,
  PermissionTag,
} from '@/graphql/generated/types';
import { PivotRepository } from '@/graphql/repositories/common';

import { PermissionTagModel, permissionTags } from './schema';

export class PermissionTagRepository extends PivotRepository<PermissionTagModel, PermissionTag> {
  protected table = permissionTags;
  protected parentIdField: keyof PermissionTagModel = 'permissionId';
  protected relatedIdField: keyof PermissionTagModel = 'tagId';

  protected toEntity(dbPivot: PermissionTagModel): PermissionTag {
    return {
      id: dbPivot.id,
      permissionId: dbPivot.permissionId,
      tagId: dbPivot.tagId,
      createdAt: dbPivot.createdAt,
      updatedAt: dbPivot.updatedAt,
      deletedAt: dbPivot.deletedAt,
    };
  }

  public async getPermissionTags(
    params: Omit<QueryPermissionTagsArgs, 'scope'>
  ): Promise<PermissionTag[]> {
    return this.query({ parentId: params.permissionId });
  }

  public async addPermissionTag(params: MutationAddPermissionTagArgs): Promise<PermissionTag> {
    return this.add({
      parentId: params.input.permissionId,
      relatedId: params.input.tagId,
    });
  }

  public async softDeletePermissionTag(
    params: MutationRemovePermissionTagArgs
  ): Promise<PermissionTag> {
    return this.softDelete({
      parentId: params.input.permissionId,
      relatedId: params.input.tagId,
    });
  }

  public async hardDeletePermissionTag(
    params: MutationRemovePermissionTagArgs
  ): Promise<PermissionTag> {
    return this.hardDelete({
      parentId: params.input.permissionId,
      relatedId: params.input.tagId,
    });
  }
}
