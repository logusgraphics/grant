import { QueryResolvers } from '@/graphql/generated/types';

export const getRolesResolver: QueryResolvers['roles'] = async (
  _parent,
  { scope, page = 1, limit = 10, sort, search, ids, tagIds },
  context
) => {
  // Route to appropriate provider based on scope
  switch (scope.tenant) {
    case 'ORGANIZATION': {
      // Get organization-role relationships
      const organizationRoles = await context.providers.organizationRoles.getOrganizationRoles({
        organizationId: scope.id,
      });

      // Extract role IDs from organization-role relationships
      let roleIds = organizationRoles.map((or) => or.roleId);

      // Apply additional filtering if ids parameter is provided
      if (ids && ids.length > 0) {
        roleIds = roleIds.filter((roleId) => ids.includes(roleId));
      }

      if (roleIds.length === 0) {
        return {
          roles: [],
          totalCount: 0,
          hasNextPage: false,
        };
      }

      // Get roles by IDs with pagination
      const rolesResult = await context.providers.roles.getRoles({
        ids: roleIds,
        page,
        limit,
        sort,
        search,
        tagIds,
        scope, // Pass the scope to maintain consistency
      });

      return rolesResult;
    }

    case 'PROJECT': {
      // Get project-role relationships
      const projectRoles = await context.providers.projectRoles.getProjectRoles({
        projectId: scope.id,
      });

      // Extract role IDs from project-role relationships
      let roleIds = projectRoles.map((pr) => pr.roleId);

      // Apply additional filtering if ids parameter is provided
      if (ids && ids.length > 0) {
        roleIds = roleIds.filter((roleId) => ids.includes(roleId));
      }

      if (roleIds.length === 0) {
        return {
          roles: [],
          totalCount: 0,
          hasNextPage: false,
        };
      }

      // Get roles by IDs with pagination
      const rolesResult = await context.providers.roles.getRoles({
        ids: roleIds,
        page,
        limit,
        sort,
        search,
        tagIds,
        scope, // Pass the scope to maintain consistency
      });

      return rolesResult;
    }

    default:
      throw new Error(`Unsupported tenant type: ${scope.tenant}`);
  }
};
