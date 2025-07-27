import { QueryResolvers } from '@/graphql/generated/types';

export const getGroupPermissionsResolver: QueryResolvers['groupPermissions'] = async (
  _parent,
  { groupId },
  context
) => {
  const groupPermissions = await context.providers.groupPermissions.getGroupPermissions({
    groupId,
  });
  return groupPermissions;
};
