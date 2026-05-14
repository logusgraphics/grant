import { QueryResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const projectSyncJobsResolver: QueryResolvers<GraphqlContext>['projectSyncJobs'] = async (
  _parent,
  args,
  context
) => {
  return context.handlers.projects.listProjectSyncJobs(args);
};
