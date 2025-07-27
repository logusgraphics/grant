import {
  MutationAddGroupPermissionArgs,
  MutationRemoveGroupPermissionArgs,
  GroupPermission,
} from '@/graphql/generated/types';

export type GetGroupPermissionsParams = { groupId: string };
export type GetGroupPermissionsResult = GroupPermission[];

export type AddGroupPermissionParams = MutationAddGroupPermissionArgs;
export type AddGroupPermissionResult = GroupPermission;

export type RemoveGroupPermissionParams = MutationRemoveGroupPermissionArgs;
export type RemoveGroupPermissionResult = boolean;

export interface GroupPermissionDataProvider {
  getGroupPermissions(params: GetGroupPermissionsParams): Promise<GetGroupPermissionsResult>;
  addGroupPermission(params: AddGroupPermissionParams): Promise<AddGroupPermissionResult>;
  removeGroupPermission(params: RemoveGroupPermissionParams): Promise<RemoveGroupPermissionResult>;
}
