import { MutationResolvers } from '@/graphql/generated/types';

export const deleteGroupResolver: MutationResolvers['deleteGroup'] = async (
  _parent,
  { id },
  context
) => {
  const deletedGroup = await context.controllers.groups.deleteGroup({ id });
  return deletedGroup;
};
