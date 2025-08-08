import { OrganizationResolvers, Tenant } from '@/graphql/generated/types';

export const organizationPermissionsResolver: OrganizationResolvers['permissions'] = async (
  parent,
  _args,
  context
) => {
  const organizationId = parent.id;
  // Get organization-permission relationships for this organization
  const organizationPermissions =
    await context.providers.organizationPermissions.getOrganizationPermissions({
      organizationId,
    });

  // Extract permission IDs from organization-permission relationships
  const permissionIds = organizationPermissions.map((op) => op.permissionId);

  if (permissionIds.length === 0) {
    return [];
  }

  // Get all permissions with limit -1
  const permissionsResult = await context.providers.permissions.getPermissions({
    ids: permissionIds,
    scope: {
      tenant: Tenant.Organization,
      id: organizationId,
    },
    limit: -1,
  });

  return permissionsResult.permissions;
};
