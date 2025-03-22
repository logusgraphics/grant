import * as userQueries from './users/queries';

export const Query = {
  _empty: () => null,
  users: userQueries.getUsers,
} as const;
