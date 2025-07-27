import { groupPermissionGroupResolver } from './group';
import { groupPermissionPermissionResolver } from './permission';

export const GroupPermission = {
  group: groupPermissionGroupResolver,
  permission: groupPermissionPermissionResolver,
};
