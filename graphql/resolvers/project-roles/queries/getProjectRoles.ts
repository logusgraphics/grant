import { QueryResolvers } from '@/graphql/generated/types';
export const getProjectRolesResolver: QueryResolvers['projectRoles'] = async (
  _parent,
  { projectId },
  context
) => {
  const projectRoles = await context.providers.projectRoles.getProjectRoles({
    projectId,
  });
  return projectRoles;
};
