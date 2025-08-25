import { QueryResolvers } from '@/graphql/generated/types';
import { getDirectFieldSelection } from '@/graphql/lib/fieldSelection';

export const getOrganizationsResolver: QueryResolvers['organizations'] = async (
  _parent,
  { page = 1, limit = 10, sort, search, ids, tagIds },
  context,
  info
) => {
  const requestedFields = info ? getDirectFieldSelection(info, ['organizations']) : undefined;

  const organizations = await context.services.organizations.getOrganizations({
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
