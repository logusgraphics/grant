import { MutationResolvers } from '@/graphql/generated/types';

export const addProjectPermissionResolver: MutationResolvers['addProjectPermission'] = async (
  _parent,
  { input },
  context
) => {
  const projectPermission = await context.providers.projectPermissions.addProjectPermission({
    input,
  });
  return projectPermission;
};
