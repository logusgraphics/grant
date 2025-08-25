import {
  QueryUsersArgs,
  MutationCreateUserArgs,
  MutationUpdateUserArgs,
  MutationDeleteUserArgs,
  User,
  UserPage,
} from '@/graphql/generated/types';

export interface IUserService {
  getUsers(
    params: Omit<QueryUsersArgs, 'scope'> & { requestedFields?: string[] }
  ): Promise<UserPage>;
  createUser(params: MutationCreateUserArgs): Promise<User>;
  updateUser(params: MutationUpdateUserArgs): Promise<User>;
  deleteUser(params: MutationDeleteUserArgs & { hardDelete?: boolean }): Promise<User>;
}
