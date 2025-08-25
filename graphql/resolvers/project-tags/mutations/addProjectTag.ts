import { MutationResolvers } from '@/graphql/generated/types';
export const addProjectTagResolver: MutationResolvers['addProjectTag'] = async (
  _parent,
  { input },
  context
) => {
  const projectTag = await context.services.projectTags.addProjectTag({
    input,
  });
  return projectTag;
};
