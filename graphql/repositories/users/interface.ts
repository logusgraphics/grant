import {
  QueryUsersArgs,
  MutationCreateUserArgs,
  MutationUpdateUserArgs,
  MutationDeleteUserArgs,
  User,
  UserPage,
} from '@/graphql/generated/types';

export interface IUserRepository {
  getUsers(
    params: Omit<QueryUsersArgs, 'scope'> & { requestedFields?: string[] }
  ): Promise<UserPage>;
  createUser(params: MutationCreateUserArgs): Promise<User>;
  updateUser(params: MutationUpdateUserArgs): Promise<User>;
  softDeleteUser(params: MutationDeleteUserArgs): Promise<User>;
  hardDeleteUser(params: MutationDeleteUserArgs): Promise<User>;
}
