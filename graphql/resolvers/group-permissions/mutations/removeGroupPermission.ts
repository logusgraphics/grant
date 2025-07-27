import { MutationResolvers } from '@/graphql/generated/types';

export const removeGroupPermissionResolver: MutationResolvers['removeGroupPermission'] = async (
  _parent,
  { input },
  context
) => {
  const removed = await context.providers.groupPermissions.removeGroupPermission({ input });
  return removed;
};
