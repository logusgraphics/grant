import { UserTagResolvers } from '@/graphql/generated/types';
import { getScopedUserIds } from '@/graphql/lib/scopeFiltering';

export const userTagUserResolver: UserTagResolvers['user'] = async (parent, { scope }, context) => {
  const scopedUserIds = await getScopedUserIds({ scope, context });

  if (!scopedUserIds.includes(parent.userId)) {
    throw new Error(`User with ID ${parent.userId} is not accessible in the current scope`);
  }

  const usersResult = await context.services.users.getUsers({
    ids: [parent.userId],
    limit: 1,
  });
  const user = usersResult.users[0];
  if (!user) {
    throw new Error(`User with ID ${parent.userId} not found`);
  }
  return user;
};
