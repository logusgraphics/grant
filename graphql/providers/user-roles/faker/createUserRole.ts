import { CreateUserRoleParams, CreateUserRoleResult } from '@/graphql/providers/user-roles/types';
import { createUserRole as createUserRoleInStore } from '@/graphql/providers/user-roles/faker/dataStore';
import { UserRole } from '@/graphql/generated/types';

export async function createUserRole({
  userId,
  roleId,
}: CreateUserRoleParams): Promise<CreateUserRoleResult> {
  const userRoleData = createUserRoleInStore(userId, roleId);
  return userRoleData as UserRole; // Convert UserRoleData to UserRole for GraphQL
}
