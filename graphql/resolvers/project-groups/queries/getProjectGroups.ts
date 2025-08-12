import { QueryResolvers } from '@/graphql/generated/types';
export const getProjectGroupsResolver: QueryResolvers['projectGroups'] = async (
  _parent,
  { projectId },
  context
) => {
  const projectGroups = await context.providers.projectGroups.getProjectGroups({
    projectId,
  });
  return projectGroups;
};
