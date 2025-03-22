import { MutationResolvers } from '@/graphql/generated/types';

export const updateUserResolver: MutationResolvers['updateUser'] = async (
  _parent,
  { id, input },
  context
) => {
  const updatedUser = await context.providers.users.updateUser({ id, input });
  return updatedUser;
};
