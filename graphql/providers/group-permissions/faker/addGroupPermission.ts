import {
  AddGroupPermissionParams,
  AddGroupPermissionResult,
} from '@/graphql/providers/group-permissions/types';
import { addGroupPermission as addGroupPermissionData } from './dataStore';
import { getGroups } from '@/graphql/providers/groups/faker/dataStore';
import { getPermissions } from '@/graphql/providers/permissions/faker/dataStore';

export const addGroupPermission = async (
  params: AddGroupPermissionParams
): Promise<AddGroupPermissionResult> => {
  const { input } = params;
  const { groupId, permissionId } = input;

  // Verify that the group and permission exist
  const groups = getGroups();
  const permissions = getPermissions();

  const group = groups.find((g) => g.id === groupId);
  const permission = permissions.find((p) => p.id === permissionId);

  if (!group) {
    throw new Error(`Group with ID ${groupId} not found`);
  }

  if (!permission) {
    throw new Error(`Permission with ID ${permissionId} not found`);
  }

  // Add the group-permission relationship
  const groupPermissionData = addGroupPermissionData(groupId, permissionId);

  // Return the resolved relationship
  return {
    id: groupPermissionData.id,
    groupId: groupPermissionData.groupId,
    permissionId: groupPermissionData.permissionId,
    group,
    permission,
  };
};
