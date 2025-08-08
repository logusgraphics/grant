import { ProjectResolvers } from '@/graphql/generated/types';

export const projectUsersResolver: ProjectResolvers['users'] = async (parent, _args, context) => {
  // Get project-user relationships for this project
  const projectUsers = await context.providers.projectUsers.getProjectUsers({
    projectId: parent.id,
  });

  // Extract user IDs from project-user relationships
  const userIds = projectUsers.map((pu) => pu.userId);

  if (userIds.length === 0) {
    return [];
  }

  // Get users by IDs (optimized - no need to fetch all users)
  const usersResult = await context.providers.users.getUsers({
    ids: userIds,
  });

  return usersResult.users;
};
