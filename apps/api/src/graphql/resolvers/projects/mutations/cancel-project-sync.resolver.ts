import { MutationResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const cancelProjectSyncResolver: MutationResolvers<GraphqlContext>['cancelProjectSync'] =
  async (_parent, args, context) => {
    return context.handlers.projects.cancelProjectSync(args);
  };
