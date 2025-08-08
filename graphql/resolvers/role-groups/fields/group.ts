import { RoleGroupResolvers } from '@/graphql/generated/types';

export const roleGroupGroupResolver: RoleGroupResolvers['group'] = async (
  parent,
  { scope },
  context
) => {
  // Get all groups with limit -1
  const groupsResult = await context.providers.groups.getGroups({
    ids: [parent.groupId],
    scope,
    limit: -1,
  });

  const group = groupsResult.groups[0];

  if (!group) {
    throw new Error(`Group with ID ${parent.groupId} not found`);
  }

  return group;
};
