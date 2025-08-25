import { QueryResolvers } from '@/graphql/generated/types';
import { getDirectFieldSelection } from '@/graphql/lib/fieldSelection';
import { getScopedRoleIds } from '@/graphql/lib/scopeFiltering';

export const getRolesResolver: QueryResolvers['roles'] = async (
  _parent,
  { scope, page = 1, limit = 10, sort, search, ids, tagIds },
  context,
  info
) => {
  const requestedFields = info ? getDirectFieldSelection(info, ['roles']) : undefined;

  let roleIds = await getScopedRoleIds({ scope, context });

  if (ids && ids.length > 0) {
    roleIds = roleIds.filter((roleId) => ids.includes(roleId));
  }

  if (roleIds.length === 0) {
    return {
      roles: [],
      totalCount: 0,
      hasNextPage: false,
    };
  }

  const rolesResult = await context.services.roles.getRoles({
    ids: roleIds,
    page,
    limit,
    sort,
    search,
    tagIds,
    requestedFields,
  });

  return rolesResult;
};
