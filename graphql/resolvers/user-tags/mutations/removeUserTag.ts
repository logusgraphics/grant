import { MutationResolvers } from '@/graphql/generated/types';
export const removeUserTagResolver: MutationResolvers['removeUserTag'] = async (
  _parent,
  { input },
  context
) => {
  const removedUserTag = await context.services.userTags.removeUserTag({ input });
  return removedUserTag;
};
