import { ProjectApp, QueryResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';
import { getDirectFieldSelection } from '@/lib/field-selection.lib';

export const getProjectAppsResolver: QueryResolvers<GraphqlContext>['projectApps'] = async (
  _parent,
  { scope, page, limit, sort, search, ids, tagIds },
  context,
  info
) => {
  const requestedFields = getDirectFieldSelection<keyof ProjectApp>(info, ['projectApps']);

  return await context.handlers.projectApps.getProjectApps({
    scope,
    page,
    limit,
    sort,
    search,
    ids,
    tagIds,
    requestedFields,
  });
};
