import { RoleGroupResolvers } from '@/graphql/generated/types';

export const roleGroupGroupResolver: RoleGroupResolvers['group'] = async (
  parent,
  _args,
  context
) => {
  // Get the group by groupId (optimized - no need to fetch all groups)
  const groupsResult = await context.providers.groups.getGroups({
    ids: [parent.groupId],
  });

  const group = groupsResult.groups[0];

  if (!group) {
    throw new Error(`Group with ID ${parent.groupId} not found`);
  }

  return group;
};
