import { QueryResolvers } from '@/graphql/generated/types';
import { getScopedGroupIds, getScopedPermissionIds } from '@/graphql/lib/scopeFiltering';

export const getGroupPermissionsResolver: QueryResolvers['groupPermissions'] = async (
  _parent,
  { groupId, scope },
  context
) => {
  const [scopedGroupIds, scopedPermissionIds] = await Promise.all([
    getScopedGroupIds({ scope, context }),
    getScopedPermissionIds({ scope, context }),
  ]);

  if (!scopedGroupIds.includes(groupId)) {
    return [];
  }

  const groupPermissions = await context.services.groupPermissions.getGroupPermissions({
    groupId,
  });

  const filteredGroupPermissions = groupPermissions.filter((gp) =>
    scopedPermissionIds.includes(gp.permissionId)
  );

  return filteredGroupPermissions;
};
