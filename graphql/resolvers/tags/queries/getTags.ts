import { QueryResolvers } from '@/graphql/generated/types';
import { getDirectFieldSelection } from '@/graphql/lib/fieldSelection';
import { TagModel } from '@/graphql/repositories/tags/schema';

export const getTagsResolver: QueryResolvers['tags'] = async (
  _parent,
  { scope, page = 1, limit = 10, sort, search, ids },
  context,
  info
) => {
  const requestedFields = getDirectFieldSelection<keyof TagModel>(info, ['tags']);

  const tags = await context.controllers.tags.getTags(
    {
      scope,
      page,
      limit,
      sort,
      search,
      ids,
      requestedFields,
    },
    context.user!
  );

  return tags;
};
