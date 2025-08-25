import {
  QueryPermissionTagsArgs,
  MutationAddPermissionTagArgs,
  MutationRemovePermissionTagArgs,
  PermissionTag,
} from '@/graphql/generated/types';

export interface IPermissionTagRepository {
  getPermissionTags(params: Omit<QueryPermissionTagsArgs, 'scope'>): Promise<PermissionTag[]>;
  addPermissionTag(params: MutationAddPermissionTagArgs): Promise<PermissionTag>;
  softDeletePermissionTag(params: MutationRemovePermissionTagArgs): Promise<PermissionTag>;
  hardDeletePermissionTag(params: MutationRemovePermissionTagArgs): Promise<PermissionTag>;
}
