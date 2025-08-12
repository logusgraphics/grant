import { MutationResolvers } from '@/graphql/generated/types';
export const addProjectTagResolver: MutationResolvers['addProjectTag'] = async (
  _parent,
  { input },
  context
) => {
  const projectTag = await context.providers.projectTags.addProjectTag({
    input,
  });
  return projectTag;
};
