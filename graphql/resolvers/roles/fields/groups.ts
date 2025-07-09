import { RoleResolvers } from '@/graphql/generated/types';

export const roleGroupsResolver: RoleResolvers['groups'] = async (parent, _args, context) => {
  // Get role-group relationships for this role
  const groups = await context.providers.roleGroups.getRoleGroups({ roleId: parent.id });

  const groupIds = groups.map((g) => g.groupId);

  if (groupIds.length === 0) {
    return [];
  }

  // Get groups by IDs (optimized - no need to fetch all groups)
  const groupsResult = await context.providers.groups.getGroups({
    ids: groupIds,
  });

  return groupsResult.groups;
};
