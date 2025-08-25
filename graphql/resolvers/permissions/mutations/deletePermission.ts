import { MutationResolvers } from '@/graphql/generated/types';
export const deletePermissionResolver: MutationResolvers['deletePermission'] = async (
  _parent,
  { id },
  context
) => {
  const deletedPermission = await context.services.permissions.deletePermission({ id });
  return deletedPermission;
};
