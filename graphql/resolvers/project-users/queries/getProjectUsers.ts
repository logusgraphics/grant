import { QueryResolvers } from '@/graphql/generated/types';
export const getProjectUsersResolver: QueryResolvers['projectUsers'] = async (
  _parent,
  { projectId },
  context
) => {
  const projectUsers = await context.services.projectUsers.getProjectUsers({
    projectId,
  });
  return projectUsers;
};
