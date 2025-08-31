import { QueryResolvers } from '@/graphql/generated/types';
import { getDirectFieldSelection } from '@/graphql/lib/fieldSelection';

export const getProjectsResolver: QueryResolvers['projects'] = async (
  _parent,
  { organizationId, page, limit, sort, search, ids, tagIds },
  context,
  info
) => {
  const requestedFields = info ? getDirectFieldSelection(info, ['projects']) : undefined;

  return await context.controllers.projects.getProjects({
    organizationId,
    page,
    limit,
    sort,
    search,
    ids,
    tagIds,
    requestedFields,
  });
};
