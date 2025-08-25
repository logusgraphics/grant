import {
  QueryPermissionTagsArgs,
  MutationAddPermissionTagArgs,
  MutationRemovePermissionTagArgs,
  PermissionTag,
} from '@/graphql/generated/types';

export interface IPermissionTagService {
  getPermissionTags(params: Omit<QueryPermissionTagsArgs, 'scope'>): Promise<PermissionTag[]>;
  addPermissionTag(params: MutationAddPermissionTagArgs): Promise<PermissionTag>;
  removePermissionTag(params: MutationRemovePermissionTagArgs): Promise<PermissionTag>;
}
