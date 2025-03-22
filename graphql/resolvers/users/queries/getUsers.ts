import { QueryResolvers } from '@/graphql/generated/types';
import { getUsers } from '../providers/faker/dataStore';

export const getUsersResolver: QueryResolvers['users'] = async (
  _parent,
  { page = 1, limit = 10 }
) => {
  const users = getUsers();
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedUsers = users.slice(startIndex, endIndex);
  const totalPages = Math.ceil(users.length / limit);

  return {
    users: paginatedUsers,
    totalCount: users.length,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};
