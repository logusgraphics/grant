import { MutationResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const cancelProjectPermissionsSyncResolver: MutationResolvers<GraphqlContext>['cancelProjectPermissionsSync'] =
  async (_parent, args, context) => {
    return context.handlers.projects.cancelProjectPermissionsSync(args);
  };
