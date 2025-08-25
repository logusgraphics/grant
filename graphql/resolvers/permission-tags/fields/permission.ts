import { PermissionTagResolvers } from '@/graphql/generated/types';
import { getScopedPermissionIds } from '@/graphql/lib/scopeFiltering';

export const permissionTagPermissionResolver: PermissionTagResolvers['permission'] = async (
  parent,
  { scope },
  context
) => {
  const scopedPermissionIds = await getScopedPermissionIds({ scope, context });

  if (!scopedPermissionIds.includes(parent.permissionId)) {
    throw new Error(
      `Permission with ID ${parent.permissionId} is not accessible in the current scope`
    );
  }

  const permissionsResult = await context.services.permissions.getPermissions({
    ids: [parent.permissionId],
    limit: -1,
  });

  const permission = permissionsResult.permissions[0];

  if (!permission) {
    throw new Error(`Permission with ID ${parent.permissionId} not found`);
  }

  return permission;
};
