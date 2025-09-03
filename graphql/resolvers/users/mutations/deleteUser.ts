import { MutationResolvers } from '@/graphql/generated/types';
export const deleteUserResolver: MutationResolvers['deleteUser'] = async (
  _parent,
  { id, scope },
  context
) => {
  const deletedUser = await context.controllers.users.deleteUser({ id, scope });
  return deletedUser;
};
