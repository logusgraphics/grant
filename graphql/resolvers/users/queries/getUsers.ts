import { QueryResolvers } from '@/graphql/generated/types';
export const getUsersResolver: QueryResolvers['users'] = async (
  _parent,
  { scope, page = 1, limit = 10, sort, search, ids, tagIds },
  context
) => {
  switch (scope.tenant) {
    case 'ORGANIZATION': {
      const organizationUsers = await context.providers.organizationUsers.getOrganizationUsers({
        organizationId: scope.id,
      });
      let userIds = organizationUsers.map((ou) => ou.userId);
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
      const usersResult = await context.providers.users.getUsers({
        ids: userIds,
        page,
        limit,
        sort,
        search,
        tagIds,
        scope,
      });
      return usersResult;
    }
    case 'PROJECT': {
      const projectUsers = await context.providers.projectUsers.getProjectUsers({
        projectId: scope.id,
      });
      let userIds = projectUsers.map((pu) => pu.userId);
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
      const usersResult = await context.providers.users.getUsers({
        ids: userIds,
        page,
        limit,
        sort,
        search,
        tagIds,
        scope,
      });
      return usersResult;
    }
    default:
      throw new Error(`Unsupported tenant type: ${scope.tenant}`);
  }
};
