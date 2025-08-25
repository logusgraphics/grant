import { MutationResolvers } from '@/graphql/generated/types';
export const addGroupPermissionResolver: MutationResolvers['addGroupPermission'] = async (
  _parent,
  { input },
  context
) => {
  const addedGroupPermission = await context.services.groupPermissions.addGroupPermission({
    input,
  });
  return addedGroupPermission;
};
