import { QueryResolvers } from '@/graphql/generated/types';

export const getUserRolesResolver: QueryResolvers['userRoles'] = async (
  _parent,
  { userId },
  context
) => {
  const userRoles = await context.providers.userRoles.getUserRoles({ userId });
  return userRoles;
};
