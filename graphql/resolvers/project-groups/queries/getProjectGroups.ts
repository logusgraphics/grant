import { QueryResolvers } from '@/graphql/generated/types';
export const getProjectGroupsResolver: QueryResolvers['projectGroups'] = async (
  _parent,
  { projectId },
  context
) => {
  const projectGroups = await context.services.projectGroups.getProjectGroups({
    projectId,
  });
  return projectGroups;
};
