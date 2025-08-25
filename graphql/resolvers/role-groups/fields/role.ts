import { RoleGroupResolvers } from '@/graphql/generated/types';
import { getScopedRoleIds } from '@/graphql/lib/scopeFiltering';

export const roleGroupRoleResolver: RoleGroupResolvers['role'] = async (
  parent,
  { scope },
  context
) => {
  const scopedRoleIds = await getScopedRoleIds({ scope, context });

  if (!scopedRoleIds.includes(parent.roleId)) {
    throw new Error(`Role with ID ${parent.roleId} is not accessible in the current scope`);
  }

  const rolesResult = await context.services.roles.getRoles({
    ids: [parent.roleId],
  });
  const role = rolesResult.roles[0];
  if (!role) {
    throw new Error(`Role with ID ${parent.roleId} not found`);
  }
  return role;
};
