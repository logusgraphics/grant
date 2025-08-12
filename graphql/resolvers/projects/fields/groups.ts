import { ProjectResolvers, Tenant } from '@/graphql/generated/types';
export const projectGroupsResolver: ProjectResolvers['groups'] = async (parent, _args, context) => {
  const projectId = parent.id;
  const projectGroups = await context.providers.projectGroups.getProjectGroups({
    projectId,
  });
  const groupIds = projectGroups.map((pg) => pg.groupId);
  if (groupIds.length === 0) {
    return [];
  }
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
