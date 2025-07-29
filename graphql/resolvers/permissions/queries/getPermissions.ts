import { QueryResolvers } from '@/graphql/generated/types';

export const getPermissionsResolver: QueryResolvers['permissions'] = async (
  _parent,
  { page = 1, limit = 10, sort, search, ids, tagIds },
  context
) => {
  const permissions = await context.providers.permissions.getPermissions({
    limit,
    page,
    sort,
    search,
    ids,
    tagIds,
  });
  return permissions;
};
