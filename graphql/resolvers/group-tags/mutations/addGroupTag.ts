import { MutationResolvers } from '@/graphql/generated/types';
export const addGroupTagResolver: MutationResolvers['addGroupTag'] = async (
  _parent,
  { input },
  context
) => {
  const addedGroupTag = await context.services.groupTags.addGroupTag({ input });
  return addedGroupTag;
};
