import { QueryResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const projectPermissionsSyncJobResolver: QueryResolvers<GraphqlContext>['projectPermissionsSyncJob'] =
  async (_parent, args, context) => {
    return context.handlers.projects.getProjectPermissionsSyncJob(args);
  };
