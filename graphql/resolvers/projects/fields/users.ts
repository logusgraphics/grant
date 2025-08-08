import { ProjectResolvers, Tenant } from '@/graphql/generated/types';

export const projectUsersResolver: ProjectResolvers['users'] = async (parent, _args, context) => {
  const projectId = parent.id;
  // Get project-user relationships for this project
  const projectUsers = await context.providers.projectUsers.getProjectUsers({
    projectId,
  });

  // Extract user IDs from project-user relationships
  const userIds = projectUsers.map((pu) => pu.userId);

  if (userIds.length === 0) {
    return [];
  }

  // Get all users with limit -1
  const usersResult = await context.providers.users.getUsers({
    ids: userIds,
    scope: {
      tenant: Tenant.Project,
      id: projectId,
    },
    limit: -1,
  });

  return usersResult.users;
};
