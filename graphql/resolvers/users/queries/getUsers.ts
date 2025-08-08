import { QueryResolvers } from '@/graphql/generated/types';

export const getUsersResolver: QueryResolvers['users'] = async (
  _parent,
  { scope, page = 1, limit = 10, sort, search, ids, tagIds },
  context
) => {
  // Route to appropriate provider based on scope
  switch (scope.tenant) {
    case 'ORGANIZATION': {
      // Get organization-user relationships
      const organizationUsers = await context.providers.organizationUsers.getOrganizationUsers({
        organizationId: scope.id,
      });

      // Extract user IDs from organization-user relationships
      let userIds = organizationUsers.map((ou) => ou.userId);

      // Apply additional filtering if ids parameter is provided
      if (ids && ids.length > 0) {
        userIds = userIds.filter((userId) => ids.includes(userId));
      }

      if (userIds.length === 0) {
        return {
          users: [],
          totalCount: 0,
          hasNextPage: false,
        };
      }

      // Get users by IDs with pagination
      const usersResult = await context.providers.users.getUsers({
        ids: userIds,
        page,
        limit,
        sort,
        search,
        tagIds,
        scope, // Pass the scope to maintain consistency
      });

      return usersResult;
    }

    case 'PROJECT': {
      // Get project-user relationships
      const projectUsers = await context.providers.projectUsers.getProjectUsers({
        projectId: scope.id,
      });

      // Extract user IDs from project-user relationships
      let userIds = projectUsers.map((pu) => pu.userId);

      // Apply additional filtering if ids parameter is provided
      if (ids && ids.length > 0) {
        userIds = userIds.filter((userId) => ids.includes(userId));
      }

      if (userIds.length === 0) {
        return {
          users: [],
          totalCount: 0,
          hasNextPage: false,
        };
      }

      // Get users by IDs with pagination
      const usersResult = await context.providers.users.getUsers({
        ids: userIds,
        page,
        limit,
        sort,
        search,
        tagIds,
        scope, // Pass the scope to maintain consistency
      });

      return usersResult;
    }

    default:
      throw new Error(`Unsupported tenant type: ${scope.tenant}`);
  }
};
