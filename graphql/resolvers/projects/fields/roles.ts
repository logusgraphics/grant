import { ProjectResolvers } from '@/graphql/generated/types';

export const projectRolesResolver: ProjectResolvers['roles'] = async (parent, _args, context) => {
  // Get project-role relationships for this project
  const projectRoles = await context.providers.projectRoles.getProjectRoles({
    projectId: parent.id,
  });

  // Extract role IDs from project-role relationships
  const roleIds = projectRoles.map((pr) => pr.roleId);

  if (roleIds.length === 0) {
    return [];
  }

  // Get roles by IDs (optimized - no need to fetch all roles)
  const rolesResult = await context.providers.roles.getRoles({
    ids: roleIds,
  });

  return rolesResult.roles;
};
