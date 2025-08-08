import { QueryResolvers } from '@/graphql/generated/types';

export const getGroupsResolver: QueryResolvers['groups'] = async (
  _parent,
  { scope, page = 1, limit = 10, sort, search, ids, tagIds },
  context
) => {
  // Route to appropriate provider based on scope
  switch (scope.tenant) {
    case 'ORGANIZATION': {
      // Get organization-group relationships
      const organizationGroups = await context.providers.organizationGroups.getOrganizationGroups({
        organizationId: scope.id,
      });

      // Extract group IDs from organization-group relationships
      let groupIds = organizationGroups.map((og) => og.groupId);

      // Apply additional filtering if ids parameter is provided
      if (ids && ids.length > 0) {
        groupIds = groupIds.filter((groupId) => ids.includes(groupId));
      }

      if (groupIds.length === 0) {
        return {
          groups: [],
          totalCount: 0,
          hasNextPage: false,
        };
      }

      // Get groups by IDs with pagination
      const groupsResult = await context.providers.groups.getGroups({
        ids: groupIds,
        page,
        limit,
        sort,
        search,
        tagIds,
        scope, // Pass the scope to maintain consistency
      });

      return groupsResult;
    }

    case 'PROJECT': {
      // Get project-group relationships
      const projectGroups = await context.providers.projectGroups.getProjectGroups({
        projectId: scope.id,
      });

      // Extract group IDs from project-group relationships
      let groupIds = projectGroups.map((pg) => pg.groupId);

      // Apply additional filtering if ids parameter is provided
      if (ids && ids.length > 0) {
        groupIds = groupIds.filter((groupId) => ids.includes(groupId));
      }

      if (groupIds.length === 0) {
        return {
          groups: [],
          totalCount: 0,
          hasNextPage: false,
        };
      }

      // Get groups by IDs with pagination
      const groupsResult = await context.providers.groups.getGroups({
        ids: groupIds,
        page,
        limit,
        sort,
        search,
        tagIds,
        scope, // Pass the scope to maintain consistency
      });

      return groupsResult;
    }

    default:
      throw new Error(`Unsupported tenant type: ${scope.tenant}`);
  }
};
