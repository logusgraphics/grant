import { UserRole } from '@/graphql/generated/types';

export type GetUserRolesParams = {
  userId: string;
};

export type GetUserRolesResult = UserRole[];

export type CreateUserRoleParams = {
  userId: string;
  roleId: string;
};

export type CreateUserRoleResult = UserRole;

export type DeleteUserRoleParams = {
  id: string;
};

export type DeleteUserRoleResult = UserRole;

export interface UserRoleDataProvider {
  getUserRoles(params: GetUserRolesParams): Promise<GetUserRolesResult>;
  createUserRole(params: CreateUserRoleParams): Promise<CreateUserRoleResult>;
  deleteUserRole(params: DeleteUserRoleParams): Promise<DeleteUserRoleResult>;
}
