import { ProjectResolvers, Tenant } from '@/graphql/generated/types';
export const projectUsersResolver: ProjectResolvers['users'] = async (parent, _args, context) => {
  const projectId = parent.id;
  const projectUsers = await context.providers.projectUsers.getProjectUsers({
    projectId,
  });
  const userIds = projectUsers.map((pu) => pu.userId);
  if (userIds.length === 0) {
    return [];
  }
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
