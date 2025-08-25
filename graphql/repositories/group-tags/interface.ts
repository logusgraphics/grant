import { GroupTag, QueryGroupTagsArgs } from '@/graphql/generated/types';

export interface IGroupTagRepository {
  getGroupTags(params: Omit<QueryGroupTagsArgs, 'scope'>): Promise<GroupTag[]>;
  addGroupTag(groupId: string, tagId: string): Promise<GroupTag>;
  softDeleteGroupTag(groupId: string, tagId: string): Promise<GroupTag | null>;
  hardDeleteGroupTag(groupId: string, tagId: string): Promise<GroupTag | null>;
}
