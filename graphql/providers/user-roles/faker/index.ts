import { UserRoleDataProvider } from '@/graphql/providers/user-roles/types';
import { getUserRoles } from '@/graphql/providers/user-roles/faker/getUserRoles';
import { createUserRole } from '@/graphql/providers/user-roles/faker/createUserRole';
import { deleteUserRole } from '@/graphql/providers/user-roles/faker/deleteUserRole';

export const userRoleFakerProvider: UserRoleDataProvider = {
  getUserRoles,
  createUserRole,
  deleteUserRole,
};
