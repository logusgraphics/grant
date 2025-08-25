import {
  QueryUsersArgs,
  MutationCreateUserArgs,
  MutationUpdateUserArgs,
  MutationDeleteUserArgs,
  User,
  UserPage,
} from '@/graphql/generated/types';

import { UserDataProvider } from '../types';

import { createUser } from './createUser';
import { deleteUser } from './deleteUser';
import { getUsers } from './getUsers';
import { updateUser } from './updateUser';

export const userFakerProvider: UserDataProvider = {
  async getUsers(params: QueryUsersArgs & { requestedFields?: string[] }): Promise<UserPage> {
    return getUsers(params);
  },

  async createUser(params: MutationCreateUserArgs): Promise<User> {
    return createUser(params);
  },

  async updateUser(params: MutationUpdateUserArgs): Promise<User> {
    return updateUser(params);
  },

  async deleteUser(params: MutationDeleteUserArgs): Promise<User> {
    return deleteUser(params);
  },
};
