import { RoleGroupResolvers } from '@/graphql/generated/types';

export const roleGroupRoleResolver: RoleGroupResolvers['role'] = async (
  parent,
  { scope },
  context
) => {
  // Get all roles with limit -1
  const rolesResult = await context.providers.roles.getRoles({
    ids: [parent.roleId],
    scope,
    limit: -1,
  });

  const role = rolesResult.roles[0];

  if (!role) {
    throw new Error(`Role with ID ${parent.roleId} not found`);
  }

  return role;
};
