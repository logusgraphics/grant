import { QueryResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const projectSyncJobResolver: QueryResolvers<GraphqlContext>['projectSyncJob'] = async (
  _parent,
  args,
  context
) => {
  return context.handlers.projects.getProjectSyncJob(args);
};
