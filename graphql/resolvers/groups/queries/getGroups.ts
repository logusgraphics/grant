import { QueryResolvers } from '@/graphql/generated/types';
export const getGroupsResolver: QueryResolvers['groups'] = async (
  _parent,
  { scope, page = 1, limit = 10, sort, search, ids, tagIds },
  context
) => {
  switch (scope.tenant) {
    case 'ORGANIZATION': {
      const organizationGroups = await context.providers.organizationGroups.getOrganizationGroups({
        organizationId: scope.id,
      });
      let groupIds = organizationGroups.map((og) => og.groupId);
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
      const groupsResult = await context.providers.groups.getGroups({
        ids: groupIds,
        page,
        limit,
        sort,
        search,
        tagIds,
        scope,
      });
      return groupsResult;
    }
    case 'PROJECT': {
      const projectGroups = await context.providers.projectGroups.getProjectGroups({
        projectId: scope.id,
      });
      let groupIds = projectGroups.map((pg) => pg.groupId);
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
      const groupsResult = await context.providers.groups.getGroups({
        ids: groupIds,
        page,
        limit,
        sort,
        search,
        tagIds,
        scope,
      });
      return groupsResult;
    }
    default:
      throw new Error(`Unsupported tenant type: ${scope.tenant}`);
  }
};
