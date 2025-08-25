import { MutationResolvers } from '@/graphql/generated/types';
export const removeProjectTagResolver: MutationResolvers['removeProjectTag'] = async (
  _parent,
  { input },
  context
) => {
  const removedProjectTag = await context.services.projectTags.removeProjectTag({
    input,
  });
  return removedProjectTag;
};
