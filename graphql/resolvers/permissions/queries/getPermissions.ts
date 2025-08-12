import { QueryResolvers } from '@/graphql/generated/types';
export const getPermissionsResolver: QueryResolvers['permissions'] = async (
  _parent,
  { scope, page = 1, limit = 10, sort, search, ids, tagIds },
  context
) => {
  switch (scope.tenant) {
    case 'ORGANIZATION': {
      const organizationPermissions =
        await context.providers.organizationPermissions.getOrganizationPermissions({
          organizationId: scope.id,
        });
      let permissionIds = organizationPermissions.map((op) => op.permissionId);
      if (ids && ids.length > 0) {
        permissionIds = permissionIds.filter((permissionId) => ids.includes(permissionId));
      }
      if (permissionIds.length === 0) {
        return {
          permissions: [],
          totalCount: 0,
          hasNextPage: false,
        };
      }
      const permissionsResult = await context.providers.permissions.getPermissions({
        ids: permissionIds,
        page,
        limit,
        sort,
        search,
        tagIds,
        scope,
      });
      return permissionsResult;
    }
    case 'PROJECT': {
      const projectPermissions = await context.providers.projectPermissions.getProjectPermissions({
        projectId: scope.id,
      });
      let permissionIds = projectPermissions.map((pp) => pp.permissionId);
      if (ids && ids.length > 0) {
        permissionIds = permissionIds.filter((permissionId) => ids.includes(permissionId));
      }
      if (permissionIds.length === 0) {
        return {
          permissions: [],
          totalCount: 0,
          hasNextPage: false,
        };
      }
      const permissionsResult = await context.providers.permissions.getPermissions({
        ids: permissionIds,
        page,
        limit,
        sort,
        search,
        tagIds,
        scope,
      });
      return permissionsResult;
    }
    default:
      throw new Error(`Unsupported tenant type: ${scope.tenant}`);
  }
};
