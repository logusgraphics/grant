import {
  MutationAddUserTagArgs,
  MutationRemoveUserTagArgs,
  QueryUserTagsArgs,
  UserTag,
} from '@/graphql/generated/types';

export interface IUserTagRepository {
  getUserTags(params: Omit<QueryUserTagsArgs, 'scope'>): Promise<UserTag[]>;
  addUserTag(params: MutationAddUserTagArgs): Promise<UserTag>;
  softDeleteUserTag(params: MutationRemoveUserTagArgs): Promise<UserTag>;
  hardDeleteUserTag(params: MutationRemoveUserTagArgs): Promise<UserTag>;
}
