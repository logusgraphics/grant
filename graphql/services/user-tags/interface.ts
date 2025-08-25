import {
  MutationAddUserTagArgs,
  MutationRemoveUserTagArgs,
  QueryUserTagsArgs,
  UserTag,
} from '@/graphql/generated/types';

export interface IUserTagService {
  getUserTags(params: Omit<QueryUserTagsArgs, 'scope'>): Promise<UserTag[]>;
  addUserTag(params: MutationAddUserTagArgs): Promise<UserTag>;
  removeUserTag(params: MutationRemoveUserTagArgs & { hardDelete?: boolean }): Promise<UserTag>;
}
