import { QueryResolvers } from '@/graphql/generated/types';

export const getPermissionsResolver: QueryResolvers['permissions'] = async (
  _parent,
  { scope, page = 1, limit = 10, sort, search, ids, tagIds },
  context
) => {
  // Route to appropriate provider based on scope
  switch (scope.tenant) {
    case 'ORGANIZATION': {
      // Get organization-permission relationships
      const organizationPermissions =
        await context.providers.organizationPermissions.getOrganizationPermissions({
          organizationId: scope.id,
        });

      // Extract permission IDs from organization-permission relationships
      let permissionIds = organizationPermissions.map((op) => op.permissionId);

      // Apply additional filtering if ids parameter is provided
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

      // Get permissions by IDs with pagination
      const permissionsResult = await context.providers.permissions.getPermissions({
        ids: permissionIds,
        page,
        limit,
        sort,
        search,
        tagIds,
        scope, // Pass the scope to maintain consistency
      });

      return permissionsResult;
    }

    case 'PROJECT': {
      // Get project-permission relationships
      const projectPermissions = await context.providers.projectPermissions.getProjectPermissions({
        projectId: scope.id,
      });

      // Extract permission IDs from project-permission relationships
      let permissionIds = projectPermissions.map((pp) => pp.permissionId);

      // Apply additional filtering if ids parameter is provided
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

      // Get permissions by IDs with pagination
      const permissionsResult = await context.providers.permissions.getPermissions({
        ids: permissionIds,
        page,
        limit,
        sort,
        search,
        tagIds,
        scope, // Pass the scope to maintain consistency
      });

      return permissionsResult;
    }

    default:
      throw new Error(`Unsupported tenant type: ${scope.tenant}`);
  }
};
