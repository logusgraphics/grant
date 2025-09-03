import { Transaction } from '@/graphql/lib/transactions/TransactionManager';

import { PivotRepository, BasePivotAddArgs, BasePivotRemoveArgs } from '../common/PivotRepository';

import { GroupTag, groupTags } from './schema';

export class GroupTagRepository extends PivotRepository<GroupTag, GroupTag> {
  protected table = groupTags;
  protected parentIdField: keyof GroupTag = 'groupId';
  protected relatedIdField: keyof GroupTag = 'tagId';

  protected toEntity(dbGroupTag: GroupTag): GroupTag {
    return dbGroupTag;
  }

  public async getGroupTags(params: { groupId: string }): Promise<GroupTag[]> {
    return this.query({ parentId: params.groupId });
  }

  public async getGroupTagIntersection(groupIds: string[], tagIds: string[]): Promise<GroupTag[]> {
    return this.queryIntersection({ parentIds: groupIds, relatedIds: tagIds });
  }

  public async addGroupTag(
    groupId: string,
    tagId: string,
    transaction?: Transaction
  ): Promise<GroupTag> {
    const baseParams: BasePivotAddArgs = {
      parentId: groupId,
      relatedId: tagId,
    };

    const groupTag = await this.add(baseParams, transaction);
    return groupTag;
  }

  public async softDeleteGroupTag(
    groupId: string,
    tagId: string,
    transaction?: Transaction
  ): Promise<GroupTag | null> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: groupId,
      relatedId: tagId,
    };

    const groupTag = await this.softDelete(baseParams, transaction);
    return groupTag;
  }

  public async hardDeleteGroupTag(
    groupId: string,
    tagId: string,
    transaction?: Transaction
  ): Promise<GroupTag | null> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: groupId,
      relatedId: tagId,
    };

    const groupTag = await this.hardDelete(baseParams, transaction);
    return groupTag;
  }
}
