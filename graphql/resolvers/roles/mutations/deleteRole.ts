import { MutationResolvers } from '@/graphql/generated/types';
export const deleteRoleResolver: MutationResolvers['deleteRole'] = async (
  _parent,
  { id },
  context
) => {
  const deletedRole = await context.services.roles.deleteRole({ id });
  return deletedRole;
};
