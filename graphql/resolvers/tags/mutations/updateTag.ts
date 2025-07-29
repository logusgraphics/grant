import { MutationResolvers } from '@/graphql/generated/types';

export const updateTagResolver: MutationResolvers['updateTag'] = async (
  _parent: any,
  { id, input }: any,
  context: any
) => {
  const updatedTag = await context.providers.tags.updateTag({ id, input });
  return updatedTag;
};
