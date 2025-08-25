import { QueryResolvers } from '@/graphql/generated/types';
import { getDirectFieldSelection } from '@/graphql/lib/fieldSelection';
import { getScopedUserIds } from '@/graphql/lib/scopeFiltering';

export const getUsersResolver: QueryResolvers['users'] = async (
  _parent,
  { scope, page = 1, limit = 10, sort, search, ids, tagIds },
  context,
  info
) => {
  const requestedFields = info ? getDirectFieldSelection(info, ['users']) : undefined;

  let userIds = await getScopedUserIds({ scope, context });

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

  const usersResult = await context.services.users.getUsers({
    ids: userIds,
    page,
    limit,
    sort,
    search,
    tagIds,
    requestedFields,
  });

  return usersResult;
};
