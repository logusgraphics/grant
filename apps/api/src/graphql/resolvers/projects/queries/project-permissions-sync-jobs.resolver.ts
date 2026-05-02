import { QueryResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const projectPermissionsSyncJobsResolver: QueryResolvers<GraphqlContext>['projectPermissionsSyncJobs'] =
  async (_parent, args, context) => {
    return context.handlers.projects.listProjectPermissionsSyncJobs(args);
  };
