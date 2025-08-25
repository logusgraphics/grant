import { MutationResolvers } from '@/graphql/generated/types';
export const createPermissionResolver: MutationResolvers['createPermission'] = async (
  _parent,
  { input },
  context
) => {
  const createdPermission = await context.services.permissions.createPermission({ input });
  return createdPermission;
};
