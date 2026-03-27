import { ResourceResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const resourcePermissionsResolver: ResourceResolvers<GraphqlContext>['permissions'] = async (
  parent,
  _args,
  context
) => {
  if (parent.permissions != null) {
    return parent.permissions;
  }

  return context.handlers.permissions.getPermissionsByResourceId(parent.id);
};
