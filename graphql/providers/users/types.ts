import {
  QueryUsersArgs,
  MutationCreateUserArgs,
  MutationUpdateUserArgs,
  MutationDeleteUserArgs,
  User,
  UserPage,
} from '@/graphql/generated/types';

// Type for user data without the resolved fields (userRoles and roles)
export type UserData = Omit<User, 'userRoles' | 'roles'>;

export type GetUsersParams = QueryUsersArgs;
export type GetUsersResult = UserPage;

export type CreateUserParams = MutationCreateUserArgs;
export type CreateUserResult = User;

export type UpdateUserParams = MutationUpdateUserArgs;
export type UpdateUserResult = User;

export type DeleteUserParams = MutationDeleteUserArgs;
export type DeleteUserResult = User;

export interface UserDataProvider {
  getUsers(params: GetUsersParams): Promise<GetUsersResult>;
  createUser(params: CreateUserParams): Promise<CreateUserResult>;
  updateUser(params: UpdateUserParams): Promise<UpdateUserResult>;
  deleteUser(params: DeleteUserParams): Promise<DeleteUserResult>;
}
