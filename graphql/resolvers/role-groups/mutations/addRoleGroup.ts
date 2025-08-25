import { MutationResolvers } from '@/graphql/generated/types';

export const addRoleGroupResolver: MutationResolvers['addRoleGroup'] = async (
  _parent,
  { input },
  context
) => {
  const addedRoleGroup = await context.services.roleGroups.addRoleGroup({ input });
  return addedRoleGroup;
};
