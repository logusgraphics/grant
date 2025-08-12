import { QueryResolvers } from '@/graphql/generated/types';
export const getRolesResolver: QueryResolvers['roles'] = async (
  _parent,
  { scope, page = 1, limit = 10, sort, search, ids, tagIds },
  context
) => {
  switch (scope.tenant) {
    case 'ORGANIZATION': {
      const organizationRoles = await context.providers.organizationRoles.getOrganizationRoles({
        organizationId: scope.id,
      });
      let roleIds = organizationRoles.map((or) => or.roleId);
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
      const rolesResult = await context.providers.roles.getRoles({
        ids: roleIds,
        page,
        limit,
        sort,
        search,
        tagIds,
        scope,
      });
      return rolesResult;
    }
    case 'PROJECT': {
      const projectRoles = await context.providers.projectRoles.getProjectRoles({
        projectId: scope.id,
      });
      let roleIds = projectRoles.map((pr) => pr.roleId);
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
      const rolesResult = await context.providers.roles.getRoles({
        ids: roleIds,
        page,
        limit,
        sort,
        search,
        tagIds,
        scope,
      });
      return rolesResult;
    }
    default:
      throw new Error(`Unsupported tenant type: ${scope.tenant}`);
  }
};
