import { GroupPermissionResolvers } from '@/graphql/generated/types';

export const groupPermissionGroupResolver: GroupPermissionResolvers['group'] = async (
  parent,
  { scope },
  context
) => {
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
