import { ProjectResolvers, Tenant } from '@/graphql/generated/types';

export const projectPermissionsResolver: ProjectResolvers['permissions'] = async (
  parent,
  _args,
  context
) => {
  const projectId = parent.id;
  // Get project-permission relationships for this project
  const projectPermissions = await context.providers.projectPermissions.getProjectPermissions({
    projectId,
  });

  // Extract permission IDs from project-permission relationships
  const permissionIds = projectPermissions.map((pp) => pp.permissionId);

  if (permissionIds.length === 0) {
    return [];
  }

  // Get all permissions with limit -1
  const permissionsResult = await context.providers.permissions.getPermissions({
    ids: permissionIds,
    scope: {
      tenant: Tenant.Project,
      id: projectId,
    },
    limit: -1,
  });

  return permissionsResult.permissions;
};
