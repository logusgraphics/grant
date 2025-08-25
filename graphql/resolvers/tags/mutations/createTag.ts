import { MutationResolvers } from '@/graphql/generated/types';
export const createTagResolver: MutationResolvers['createTag'] = async (
  _parent,
  { input },
  context
) => {
  const createdTag = await context.services.tags.createTag({ input });
  return createdTag;
};
