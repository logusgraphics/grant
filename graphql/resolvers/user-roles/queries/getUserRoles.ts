import { QueryResolvers } from '@/graphql/generated/types';
import { getScopedRoleIds, getScopedUserIds } from '@/graphql/lib/scopeFiltering';

export const getUserRolesResolver: QueryResolvers['userRoles'] = async (
  _parent,
  { scope, userId },
  context
) => {
  const [scopedRoleIds, scopedUserIds] = await Promise.all([
    getScopedRoleIds({ scope, context }),
    getScopedUserIds({ scope, context }),
  ]);

  if (!scopedUserIds.includes(userId)) {
    return [];
  }

  if (scopedRoleIds.length === 0) {
    return [];
  }

  const userRoles = await context.services.userRoles.getUserRoles({
    userId,
  });

  const scopedUserRoles = userRoles.filter((userRole) => scopedRoleIds.includes(userRole.roleId));

  return scopedUserRoles;
};
