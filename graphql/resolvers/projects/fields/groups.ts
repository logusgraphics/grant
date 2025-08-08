import { ProjectResolvers } from '@/graphql/generated/types';

export const projectGroupsResolver: ProjectResolvers['groups'] = async (parent, _args, context) => {
  // Get project-group relationships for this project
  const projectGroups = await context.providers.projectGroups.getProjectGroups({
    projectId: parent.id,
  });

  // Extract group IDs from project-group relationships
  const groupIds = projectGroups.map((pg) => pg.groupId);

  if (groupIds.length === 0) {
    return [];
  }

  // Get groups by IDs (optimized - no need to fetch all groups)
  const groupsResult = await context.providers.groups.getGroups({
    ids: groupIds,
  });

  return groupsResult.groups;
};
