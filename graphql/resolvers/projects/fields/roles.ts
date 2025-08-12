import { ProjectResolvers, Tenant } from '@/graphql/generated/types';
export const projectRolesResolver: ProjectResolvers['roles'] = async (parent, _args, context) => {
  const projectId = parent.id;
  const projectRoles = await context.providers.projectRoles.getProjectRoles({
    projectId,
  });
  const roleIds = projectRoles.map((pr) => pr.roleId);
  if (roleIds.length === 0) {
    return [];
  }
  const rolesResult = await context.providers.roles.getRoles({
    ids: roleIds,
    scope: {
      tenant: Tenant.Project,
      id: projectId,
    },
    limit: -1,
  });
  return rolesResult.roles;
};
