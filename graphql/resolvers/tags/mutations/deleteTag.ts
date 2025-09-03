import { MutationResolvers } from '@/graphql/generated/types';

export const deleteTagResolver: MutationResolvers['deleteTag'] = async (
  _parent,
  { id, scope },
  context
) => {
  const deletedTag = await context.controllers.tags.deleteTag({ id, scope });
  return deletedTag;
};
