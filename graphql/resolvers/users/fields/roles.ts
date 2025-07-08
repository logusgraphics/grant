import { UserResolvers } from '@/graphql/generated/types';

export const userRolesResolver: UserResolvers['roles'] = async (parent, _args, context) => {
  // Get user-role relationships for this user
  const userRoles = await context.providers.userRoles.getUserRoles({ userId: parent.id });

  // Extract role IDs from user-role relationships
  const roleIds = userRoles.map((ur) => ur.roleId);

  if (roleIds.length === 0) {
    return [];
  }

  // Get roles by IDs (optimized - no need to fetch all roles)
  const rolesResult = await context.providers.roles.getRoles({
    ids: roleIds,
  });

  return rolesResult.roles;
};
