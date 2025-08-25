import {
  MutationAddGroupPermissionArgs,
  MutationRemoveGroupPermissionArgs,
  GroupPermission,
  QueryGroupPermissionsArgs,
} from '@/graphql/generated/types';

export interface IGroupPermissionRepository {
  getGroupPermissions(params: Omit<QueryGroupPermissionsArgs, 'scope'>): Promise<GroupPermission[]>;
  addGroupPermission(params: MutationAddGroupPermissionArgs): Promise<GroupPermission>;
  softDeleteGroupPermission(params: MutationRemoveGroupPermissionArgs): Promise<GroupPermission>;
  hardDeleteGroupPermission(params: MutationRemoveGroupPermissionArgs): Promise<GroupPermission>;
}
