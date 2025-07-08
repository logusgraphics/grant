import { QueryResolvers } from '@/graphql/generated/types';

export const getRolesResolver: QueryResolvers['roles'] = async (
  _parent,
  { page = 1, limit = 10, sort, search, ids },
  context
) => {
  const roles = await context.providers.roles.getRoles({ limit, page, sort, search, ids });
  return roles;
};
