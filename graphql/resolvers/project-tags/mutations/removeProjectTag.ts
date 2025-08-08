import { MutationResolvers } from '@/graphql/generated/types';

export const removeProjectTagResolver: MutationResolvers['removeProjectTag'] = async (
  _parent,
  { input },
  context
) => {
  const success = await context.providers.projectTags.removeProjectTag({
    input,
  });
  return success;
};
