import { MutationResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const createProjectAppResolver: MutationResolvers<GraphqlContext>['createProjectApp'] =
  async (_parent, args, context) => {
    return await context.handlers.projectApps.createProjectApp(args);
  };
