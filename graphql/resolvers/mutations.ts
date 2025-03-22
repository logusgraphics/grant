import * as userMutations from './users/mutations';
import * as authMutations from './auth/mutations';

export const Mutation = {
  createUser: userMutations.createUser,
  updateUser: userMutations.updateUser,
  deleteUser: userMutations.deleteUser,
  login: authMutations.login,
} as const;
