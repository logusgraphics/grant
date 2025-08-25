import { MutationResolvers } from '@/graphql/generated/types';
export const addUserTagResolver: MutationResolvers['addUserTag'] = async (
  _parent,
  { input },
  context
) => {
  const addedUserTag = await context.services.userTags.addUserTag({ input });
  return addedUserTag;
};
