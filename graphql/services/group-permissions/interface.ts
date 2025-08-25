import {
  MutationAddGroupPermissionArgs,
  MutationRemoveGroupPermissionArgs,
  GroupPermission,
  QueryGroupPermissionsArgs,
} from '@/graphql/generated/types';

export interface IGroupPermissionService {
  getGroupPermissions(params: Omit<QueryGroupPermissionsArgs, 'scope'>): Promise<GroupPermission[]>;
  addGroupPermission(params: MutationAddGroupPermissionArgs): Promise<GroupPermission>;
  removeGroupPermission(params: MutationRemoveGroupPermissionArgs): Promise<GroupPermission>;
}
