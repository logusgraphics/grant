import { OrganizationResolvers, Tenant } from '@/graphql/generated/types';

export const organizationRolesResolver: OrganizationResolvers['roles'] = async (
  parent,
  _args,
  context
) => {
  const organizationId = parent.id;
  // Get organization-role relationships for this organization
  const organizationRoles = await context.providers.organizationRoles.getOrganizationRoles({
    organizationId,
  });

  // Extract role IDs from organization-role relationships
  const roleIds = organizationRoles.map((or) => or.roleId);

  if (roleIds.length === 0) {
    return [];
  }

  // Get all roles with limit -1
  const rolesResult = await context.providers.roles.getRoles({
    ids: roleIds,
    scope: {
      tenant: Tenant.Organization,
      id: organizationId,
    },
    limit: -1,
  });

  return rolesResult.roles;
};
