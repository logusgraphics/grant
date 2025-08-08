import { ProjectResolvers, Tenant } from '@/graphql/generated/types';

export const projectRolesResolver: ProjectResolvers['roles'] = async (parent, _args, context) => {
  const projectId = parent.id;
  // Get project-role relationships for this project
  const projectRoles = await context.providers.projectRoles.getProjectRoles({
    projectId,
  });

  // Extract role IDs from project-role relationships
  const roleIds = projectRoles.map((pr) => pr.roleId);

  if (roleIds.length === 0) {
    return [];
  }

  // Get all roles with limit -1
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
