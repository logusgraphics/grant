import { ProjectResolvers, Tenant } from '@/graphql/generated/types';
export const projectPermissionsResolver: ProjectResolvers['permissions'] = async (
  parent,
  _args,
  context
) => {
  const projectId = parent.id;
  const projectPermissions = await context.providers.projectPermissions.getProjectPermissions({
    projectId,
  });
  const permissionIds = projectPermissions.map((pp) => pp.permissionId);
  if (permissionIds.length === 0) {
    return [];
  }
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
