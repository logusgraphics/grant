import { ProjectResolvers, Tenant } from '@/graphql/generated/types';

export const projectGroupsResolver: ProjectResolvers['groups'] = async (parent, _args, context) => {
  const projectId = parent.id;
  // Get project-group relationships for this project
  const projectGroups = await context.providers.projectGroups.getProjectGroups({
    projectId,
  });

  // Extract group IDs from project-group relationships
  const groupIds = projectGroups.map((pg) => pg.groupId);

  if (groupIds.length === 0) {
    return [];
  }

  // Get all groups with limit -1
  const groupsResult = await context.providers.groups.getGroups({
    ids: groupIds,
    scope: {
      tenant: Tenant.Project,
      id: projectId,
    },
    limit: -1,
  });

  return groupsResult.groups;
};
