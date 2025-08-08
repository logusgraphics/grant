import { UserRoleResolvers } from '@/graphql/generated/types';

export const userRoleUserResolver: UserRoleResolvers['user'] = async (
  parent,
  { scope },
  context
) => {
  // Get all users with limit -1
  const usersResult = await context.providers.users.getUsers({
    ids: [parent.userId],
    scope,
    limit: -1,
  });

  const user = usersResult.users[0];

  if (!user) {
    throw new Error(`User with ID ${parent.userId} not found`);
  }

  return user;
};
