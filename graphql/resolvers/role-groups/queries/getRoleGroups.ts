import { QueryResolvers } from '@/graphql/generated/types';

export const getRoleGroupsResolver: QueryResolvers['roleGroups'] = async (
  _parent,
  { roleId },
  context
) => {
  const roleGroups = await context.providers.roleGroups.getRoleGroups({ roleId });
  return roleGroups;
};
