import { QueryResolvers } from '@/graphql/generated/types';
import { getDirectFieldSelection } from '@/graphql/lib/fieldSelection';
import { UserModel } from '@/graphql/repositories/users/schema';

export const getUsersResolver: QueryResolvers['users'] = async (
  _parent,
  { scope, page, limit, sort, search, ids, tagIds },
  context,
  info
) => {
  const requestedFields = getDirectFieldSelection<keyof UserModel>(info, ['users']);

  const users = await context.controllers.users.getUsers({
    scope,
    page,
    limit,
    sort,
    search,
    ids,
    tagIds,
    requestedFields,
  });

  return users;
};
