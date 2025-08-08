import { QueryResolvers } from '@/graphql/generated/types';

export const getProjectPermissionsResolver: QueryResolvers['projectPermissions'] = async (
  _parent,
  { projectId },
  context
) => {
  const projectPermissions = await context.providers.projectPermissions.getProjectPermissions({
    projectId,
  });
  return projectPermissions;
};
