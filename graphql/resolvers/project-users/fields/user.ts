import { ProjectUserResolvers, Tenant } from '@/graphql/generated/types';

export const projectUserUserResolver: ProjectUserResolvers['user'] = async (
  parent,
  _args,
  context
) => {
  const projectId = parent.id;
  // Get all users with limit -1
  const usersResult = await context.providers.users.getUsers({
    ids: [parent.userId],
    scope: {
      tenant: Tenant.Project,
      id: projectId,
    },
    limit: -1,
  });

  const user = usersResult.users[0];

  if (!user) {
    throw new Error(`User with ID ${parent.userId} not found`);
  }

  return user;
};
