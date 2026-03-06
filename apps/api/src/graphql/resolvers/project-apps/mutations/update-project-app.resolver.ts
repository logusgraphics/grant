import { MutationResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const updateProjectAppResolver: MutationResolvers<GraphqlContext>['updateProjectApp'] =
  async (_parent, args, context) => {
    return await context.handlers.projectApps.updateProjectApp(args);
  };
