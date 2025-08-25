import { QueryResolvers } from '@/graphql/generated/types';
export const getProjectRolesResolver: QueryResolvers['projectRoles'] = async (
  _parent,
  { projectId },
  context
) => {
  const projectRoles = await context.services.projectRoles.getProjectRoles({
    projectId,
  });
  return projectRoles;
};
