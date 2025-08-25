import { QueryResolvers } from '@/graphql/generated/types';
export const getProjectTagsResolver: QueryResolvers['projectTags'] = async (
  _parent,
  { projectId },
  context
) => {
  const projectTags = await context.services.projectTags.getProjectTags({
    projectId,
  });
  return projectTags;
};
