import { GroupResolvers } from '@/graphql/generated/types';

export const groupPermissionsResolver: GroupResolvers['permissions'] = async (
  parent,
  _args,
  context
) => {
  // Get group-permission relationships for this group
  const groupPermissions = await context.providers.groupPermissions.getGroupPermissions({
    groupId: parent.id,
  });

  const permissionIds = groupPermissions.map((gp) => gp.permissionId);

  if (permissionIds.length === 0) {
    return [];
  }

  // Get permissions by IDs (optimized - no need to fetch all permissions)
  const permissionsResult = await context.providers.permissions.getPermissions({
    ids: permissionIds,
  });

  return permissionsResult.permissions;
};
