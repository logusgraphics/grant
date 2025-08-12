import { MutationResolvers } from '@/graphql/generated/types';
export const removeRoleGroupResolver: MutationResolvers['removeRoleGroup'] = async (
  _parent,
  { input },
  context
) => {
  const removedRoleGroup = await context.providers.roleGroups.removeRoleGroup({ input });
  return removedRoleGroup;
};
