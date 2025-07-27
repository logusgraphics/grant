import { GroupPermissionDataProvider } from '@/graphql/providers/group-permissions/types';
import { getGroupPermissions } from '@/graphql/providers/group-permissions/faker/getGroupPermissions';
import { addGroupPermission } from '@/graphql/providers/group-permissions/faker/addGroupPermission';
import { removeGroupPermission } from '@/graphql/providers/group-permissions/faker/removeGroupPermission';

export const groupPermissionFakerProvider: GroupPermissionDataProvider = {
  getGroupPermissions,
  addGroupPermission,
  removeGroupPermission,
};
