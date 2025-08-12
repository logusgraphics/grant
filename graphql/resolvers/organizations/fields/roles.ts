import { OrganizationResolvers, Tenant } from '@/graphql/generated/types';
export const organizationRolesResolver: OrganizationResolvers['roles'] = async (
  parent,
  _args,
  context
) => {
  const organizationId = parent.id;
  const organizationRoles = await context.providers.organizationRoles.getOrganizationRoles({
    organizationId,
  });
  const roleIds = organizationRoles.map((or) => or.roleId);
  if (roleIds.length === 0) {
    return [];
  }
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
