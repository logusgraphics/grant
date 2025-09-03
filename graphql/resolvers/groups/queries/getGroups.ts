import { QueryResolvers } from '@/graphql/generated/types';
import { getDirectFieldSelection } from '@/graphql/lib/fieldSelection';
import { GroupModel } from '@/graphql/repositories/groups/schema';

export const getGroupsResolver: QueryResolvers['groups'] = async (
  _parent,
  { scope, page = 1, limit = 10, sort, search, ids, tagIds },
  context,
  info
) => {
  const requestedFields = getDirectFieldSelection<keyof GroupModel>(info, ['groups']);

  const groups = await context.controllers.groups.getGroups({
    scope,
    page,
    limit,
    sort,
    search,
    ids,
    tagIds,
    requestedFields,
  });

  return groups;
};
