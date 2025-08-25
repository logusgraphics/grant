import { RoleGroupResolvers } from '@/graphql/generated/types';
import { getScopedGroupIds } from '@/graphql/lib/scopeFiltering';

export const roleGroupGroupResolver: RoleGroupResolvers['group'] = async (
  parent,
  { scope },
  context
) => {
  const scopedGroupIds = await getScopedGroupIds({ scope, context });

  if (!scopedGroupIds.includes(parent.groupId)) {
    throw new Error(`Group with ID ${parent.groupId} is not accessible in the current scope`);
  }

  const groupsResult = await context.services.groups.getGroups({
    ids: [parent.groupId],
    limit: -1,
  });

  const group = groupsResult.groups[0];

  if (!group) {
    throw new Error(`Group with ID ${parent.groupId} not found`);
  }

  return group;
};
