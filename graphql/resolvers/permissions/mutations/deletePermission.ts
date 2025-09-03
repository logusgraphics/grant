import { MutationResolvers } from '@/graphql/generated/types';

export const deletePermissionResolver: MutationResolvers['deletePermission'] = async (
  _parent,
  { id, scope },
  context
) => {
  const deletedPermission = await context.controllers.permissions.deletePermission({ id, scope });
  return deletedPermission;
};
