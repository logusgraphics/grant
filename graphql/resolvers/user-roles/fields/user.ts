import { UserRoleResolvers } from '@/graphql/generated/types';

export const userRoleUserResolver: UserRoleResolvers['user'] = async (parent, _args, context) => {
  // Get the user by userId (optimized - no need to fetch all users)
  const usersResult = await context.providers.users.getUsers({
    page: 1,
    limit: 1, // We only need one user
  });

  const user = usersResult.users.find((u) => u.id === parent.userId);

  if (!user) {
    throw new Error(`User with ID ${parent.userId} not found`);
  }

  return user;
};
