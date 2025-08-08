import { OrganizationRoleResolvers, Tenant } from '@/graphql/generated/types';

export const organizationRoleRoleResolver: OrganizationRoleResolvers['role'] = async (
  parent,
  _args,
  context
) => {
  // Get the role by roleId (optimized - no need to fetch all roles)
  const rolesResult = await context.providers.roles.getRoles({
    ids: [parent.roleId],
    scope: {
      tenant: Tenant.Organization,
      id: parent.organizationId,
    },
    limit: -1,
  });

  const role = rolesResult.roles[0];

  if (!role) {
    throw new Error(`Role with ID ${parent.roleId} not found`);
  }

  return role;
};
