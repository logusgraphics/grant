import {
  MutationAddUserRoleArgs,
  MutationRemoveUserRoleArgs,
  QueryUserRolesArgs,
  UserRole,
} from '@/graphql/generated/types';

export interface IUserRoleService {
  getUserRoles(params: Omit<QueryUserRolesArgs, 'scope'>): Promise<UserRole[]>;
  addUserRole(params: MutationAddUserRoleArgs): Promise<UserRole>;
  removeUserRole(params: MutationRemoveUserRoleArgs & { hardDelete?: boolean }): Promise<UserRole>;
}
