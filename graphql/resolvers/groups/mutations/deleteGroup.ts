import { MutationResolvers } from '@/graphql/generated/types';

export const deleteGroupResolver: MutationResolvers['deleteGroup'] = async (
  _parent,
  { id },
  context
) => {
  const deletedGroup = await context.services.groups.deleteGroup({ id });
  return deletedGroup;
};
