import { ProjectResolvers } from '@/graphql/generated/types';

export const projectPermissionsResolver: ProjectResolvers['permissions'] = async (
  parent,
  _args,
  context
) => {
  // Get project-permission relationships for this project
  const projectPermissions = await context.providers.projectPermissions.getProjectPermissions({
    projectId: parent.id,
  });

  // Extract permission IDs from project-permission relationships
  const permissionIds = projectPermissions.map((pp) => pp.permissionId);

  if (permissionIds.length === 0) {
    return [];
  }

  // Get permissions by IDs (optimized - no need to fetch all permissions)
  const permissionsResult = await context.providers.permissions.getPermissions({
    ids: permissionIds,
  });

  return permissionsResult.permissions;
};
