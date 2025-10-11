import { OrganizationModel } from '@logusgraphics/grant-database';
import { QueryResolvers } from '@logusgraphics/grant-schema';

import { GraphqlContext } from '@/graphql/types';
import { getDirectFieldSelection } from '@/lib/field-selection.lib';

export const getOrganizationsResolver: QueryResolvers<GraphqlContext>['organizations'] = async (
  _parent,
  args,
  context,
  info
) => {
  const requestedFields = getDirectFieldSelection<keyof OrganizationModel>(info, ['organizations']);

  return context.handlers.organizations.getOrganizations({
    ...args,
    requestedFields,
  });
};
