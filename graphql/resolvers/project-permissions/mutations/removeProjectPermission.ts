import { MutationResolvers } from '@/graphql/generated/types';

export const removeProjectPermissionResolver: MutationResolvers['removeProjectPermission'] = async (
  _parent,
  { input },
  context
) => {
  const success = await context.providers.projectPermissions.removeProjectPermission({
    input,
  });
  return success;
};
