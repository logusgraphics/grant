import { MutationResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const deleteProjectAppResolver: MutationResolvers<GraphqlContext>['deleteProjectApp'] =
  async (_parent, args, context) => {
    return await context.handlers.projectApps.deleteProjectApp(args);
  };
