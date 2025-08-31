import { QueryGroupTagsArgs } from '@/graphql/generated/types';

import {
  PivotRepository,
  BasePivotQueryArgs,
  BasePivotAddArgs,
  BasePivotRemoveArgs,
} from '../common/PivotRepository';

import { GroupTag, groupTags } from './schema';

export class GroupTagRepository extends PivotRepository<GroupTag, GroupTag> {
  protected table = groupTags;
  protected parentIdField: keyof GroupTag = 'groupId';
  protected relatedIdField: keyof GroupTag = 'tagId';

  protected toEntity(dbGroupTag: GroupTag): GroupTag {
    return dbGroupTag;
  }

  public async getGroupTags(params: Omit<QueryGroupTagsArgs, 'scope'>): Promise<GroupTag[]> {
    const baseParams: BasePivotQueryArgs = {
      parentId: params.groupId,
    };
    return this.query(baseParams);
  }

  public async addGroupTag(groupId: string, tagId: string): Promise<GroupTag> {
    const baseParams: BasePivotAddArgs = {
      parentId: groupId,
      relatedId: tagId,
    };

    const groupTag = await this.add(baseParams);
    return groupTag;
  }

  public async softDeleteGroupTag(groupId: string, tagId: string): Promise<GroupTag | null> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: groupId,
      relatedId: tagId,
    };

    const groupTag = await this.softDelete(baseParams);
    return groupTag;
  }

  public async hardDeleteGroupTag(groupId: string, tagId: string): Promise<GroupTag | null> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: groupId,
      relatedId: tagId,
    };

    const groupTag = await this.hardDelete(baseParams);
    return groupTag;
  }
}
