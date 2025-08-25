import {
  MutationAddUserTagArgs,
  MutationRemoveUserTagArgs,
  UserTag,
} from '@/graphql/generated/types';
import {
  PivotRepository,
  BasePivotQueryArgs,
  BasePivotAddArgs,
  BasePivotRemoveArgs,
} from '@/graphql/repositories/common';

import { IUserTagRepository } from './interface';
import { userTags, UserTagModel } from './schema';

export class UserTagRepository
  extends PivotRepository<UserTagModel, UserTag>
  implements IUserTagRepository
{
  protected table = userTags;
  protected parentIdField: keyof UserTagModel = 'userId';
  protected relatedIdField: keyof UserTagModel = 'tagId';

  protected toEntity(dbUserTag: UserTagModel): UserTag {
    return {
      id: dbUserTag.id,
      userId: dbUserTag.userId,
      tagId: dbUserTag.tagId,
      createdAt: dbUserTag.createdAt,
      updatedAt: dbUserTag.updatedAt,
      deletedAt: dbUserTag.deletedAt,
    };
  }

  public async getUserTags(params: { userId: string }): Promise<UserTag[]> {
    const baseParams: BasePivotQueryArgs = {
      parentId: params.userId,
    };

    return this.query(baseParams);
  }

  public async addUserTag(params: MutationAddUserTagArgs): Promise<UserTag> {
    const baseParams: BasePivotAddArgs = {
      parentId: params.input.userId,
      relatedId: params.input.tagId,
    };

    const userTag = await this.add(baseParams);

    return userTag;
  }

  public async softDeleteUserTag(params: MutationRemoveUserTagArgs): Promise<UserTag> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: params.input.userId,
      relatedId: params.input.tagId,
    };

    const userTag = await this.softDelete(baseParams);

    return userTag;
  }

  public async hardDeleteUserTag(params: MutationRemoveUserTagArgs): Promise<UserTag> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: params.input.userId,
      relatedId: params.input.tagId,
    };

    const userTag = await this.hardDelete(baseParams);

    return userTag;
  }
}
