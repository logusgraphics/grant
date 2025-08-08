import { ProjectGroupResolvers, Tenant } from '@/graphql/generated/types';

export const projectGroupGroupResolver: ProjectGroupResolvers['group'] = async (
  parent,
  _args,
  context
) => {
  // Get all groups with limit -1
  const groupsResult = await context.providers.groups.getGroups({
    ids: [parent.groupId],
    scope: {
      tenant: Tenant.Project,
      id: parent.projectId,
    },
    limit: -1,
  });

  const group = groupsResult.groups[0];

  if (!group) {
    throw new Error(`Group with ID ${parent.groupId} not found`);
  }

  return group;
};
