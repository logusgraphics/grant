import { MutationResolvers } from '@/graphql/generated/types';

export const updateTagResolver: MutationResolvers['updateTag'] = async (
  _parent,
  { id, input },
  context
) => {
  const updatedTag = await context.controllers.tags.updateTag({ id, input });
  return updatedTag;
};
