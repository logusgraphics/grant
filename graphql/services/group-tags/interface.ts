import {
  MutationAddGroupTagArgs,
  MutationRemoveGroupTagArgs,
  GroupTag,
  QueryGroupTagsArgs,
} from '@/graphql/generated/types';

export interface IGroupTagService {
  getGroupTags(params: Omit<QueryGroupTagsArgs, 'scope'>): Promise<GroupTag[]>;
  addGroupTag(params: MutationAddGroupTagArgs): Promise<GroupTag>;
  removeGroupTag(params: MutationRemoveGroupTagArgs): Promise<GroupTag>;
}
