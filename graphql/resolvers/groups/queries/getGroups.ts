import { QueryResolvers } from '@/graphql/generated/types';

export const getGroupsResolver: QueryResolvers['groups'] = async (
  _parent,
  { page = 1, limit = 10, sort, search, ids, tagIds },
  context
) => {
  const groups = await context.providers.groups.getGroups({
    limit,
    page,
    sort,
    search,
    ids,
    tagIds,
  });
  return groups;
};
