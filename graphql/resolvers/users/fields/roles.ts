import { UserResolvers } from '@/graphql/generated/types';
export const userRolesResolver: UserResolvers['roles'] = async (parent, { scope }, context) => {
  const userRoles = await context.providers.userRoles.getUserRoles({
    userId: parent.id,
    scope,
  });
  const roleIds = userRoles.map((ur) => ur.roleId);
  if (roleIds.length === 0) {
    return [];
  }
  const rolesResult = await context.providers.roles.getRoles({
    ids: roleIds,
    scope,
    limit: -1,
  });
  return rolesResult.roles;
};
