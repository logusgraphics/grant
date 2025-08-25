import {
  MutationAddUserRoleArgs,
  MutationRemoveUserRoleArgs,
  QueryUserRolesArgs,
  UserRole,
} from '@/graphql/generated/types';

export interface IUserRoleRepository {
  getUserRoles(params: Omit<QueryUserRolesArgs, 'scope'>): Promise<UserRole[]>;
  addUserRole(params: MutationAddUserRoleArgs): Promise<UserRole>;
  softDeleteUserRole(params: MutationRemoveUserRoleArgs): Promise<UserRole>;
  hardDeleteUserRole(params: MutationRemoveUserRoleArgs): Promise<UserRole>;
}
