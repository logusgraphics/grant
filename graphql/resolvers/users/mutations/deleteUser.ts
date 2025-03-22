import { MutationResolvers } from '@/graphql/generated/types';

export const deleteUserResolver: MutationResolvers['deleteUser'] = async (
  _parent,
  { id },
  context
) => {
  const deletedUser = await context.providers.users.deleteUser({ id });
  return deletedUser;
};
