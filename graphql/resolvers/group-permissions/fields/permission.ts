import { GroupPermissionResolvers } from '@/graphql/generated/types';

export const groupPermissionPermissionResolver: GroupPermissionResolvers['permission'] = async (
  parent,
  _args,
  context
) => {
  const permissionsResult = await context.providers.permissions.getPermissions({
    ids: [parent.permissionId],
  });

  const permission = permissionsResult.permissions[0];

  if (!permission) {
    throw new Error(`Permission with ID ${parent.permissionId} not found`);
  }

  return permission;
};
