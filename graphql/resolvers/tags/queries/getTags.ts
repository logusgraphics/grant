import { QueryResolvers } from '@/graphql/generated/types';

export const getTagsResolver: QueryResolvers['getTags'] = async (
  _parent: any,
  { page = 1, pageSize = 10, sort }: any,
  context: any
) => {
  const tags = await context.providers.tags.getTags({ page, pageSize, sort });
  return tags;
};
