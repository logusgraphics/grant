import { QueryResolvers } from '@/graphql/generated/types';
import { getDirectFieldSelection } from '@/graphql/lib/fieldSelection';
import { getScopedGroupIds } from '@/graphql/lib/scopeFiltering';

export const getGroupsResolver: QueryResolvers['groups'] = async (
  _parent,
  { scope, page = 1, limit = 10, sort, search, ids, tagIds },
  context,
  info
) => {
  const requestedFields = info ? getDirectFieldSelection(info, ['groups']) : undefined;

  let groupIds = await getScopedGroupIds({ scope, context });

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

  const groupsResult = await context.services.groups.getGroups({
    ids: groupIds,
    page,
    limit,
    sort,
    search,
    tagIds,
    requestedFields,
  });

  return groupsResult;
};
