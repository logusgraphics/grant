import { QueryResolvers } from '@/graphql/generated/types';
import { getDirectFieldSelection } from '@/graphql/lib/fieldSelection';
import { getScopedPermissionIds } from '@/graphql/lib/scopeFiltering';

export const getPermissionsResolver: QueryResolvers['permissions'] = async (
  _parent,
  { scope, page = 1, limit = 10, sort, search, ids, tagIds },
  context,
  info
) => {
  const requestedFields = info ? getDirectFieldSelection(info, ['permissions']) : undefined;

  let permissionIds = await getScopedPermissionIds({ scope, context });

  if (ids && ids.length > 0) {
    permissionIds = permissionIds.filter((permissionId) => ids.includes(permissionId));
  }

  if (permissionIds.length === 0) {
    return {
      permissions: [],
      totalCount: 0,
      hasNextPage: false,
    };
  }

  const permissionsResult = await context.services.permissions.getPermissions({
    ids: permissionIds,
    page,
    limit,
    sort,
    search,
    tagIds,
    requestedFields,
  });

  return permissionsResult;
};
