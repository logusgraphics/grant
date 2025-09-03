import { QueryResolvers } from '@/graphql/generated/types';
import { getDirectFieldSelection } from '@/graphql/lib/fieldSelection';
import { PermissionModel } from '@/graphql/repositories/permissions/schema';

export const getPermissionsResolver: QueryResolvers['permissions'] = async (
  _parent,
  { scope, page = 1, limit = 10, sort, search, ids, tagIds },
  context,
  info
) => {
  const requestedFields = getDirectFieldSelection<keyof PermissionModel>(info, ['permissions']);

  const permissions = await context.controllers.permissions.getPermissions({
    scope,
    page,
    limit,
    sort,
    search,
    ids,
    tagIds,
    requestedFields,
  });

  return permissions;
};
