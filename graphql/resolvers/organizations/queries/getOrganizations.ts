import { QueryResolvers } from '@/graphql/generated/types';
import { getDirectFieldSelection } from '@/graphql/lib/fieldSelection';
import { OrganizationModel } from '@/graphql/repositories/organizations/schema';

export const getOrganizationsResolver: QueryResolvers['organizations'] = async (
  _parent,
  { page = 1, limit = 10, sort, search, ids, tagIds },
  context,
  info
) => {
  const requestedFields = getDirectFieldSelection<keyof OrganizationModel>(info, ['organizations']);

  const organizations = await context.controllers.organizations.getOrganizations({
    limit,
    page,
    sort,
    search,
    ids,
    tagIds,
    requestedFields,
  });
  return organizations;
};
