import { QueryResolvers } from '@/graphql/generated/types';

export const getProjectTagsResolver: QueryResolvers['projectTags'] = async (
  _parent,
  { projectId },
  context
) => {
  const projectTags = await context.providers.projectTags.getProjectTags({
    projectId,
  });
  return projectTags;
};
