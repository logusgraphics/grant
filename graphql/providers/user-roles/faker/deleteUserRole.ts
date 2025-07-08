import { DeleteUserRoleParams, DeleteUserRoleResult } from '@/graphql/providers/user-roles/types';
import { deleteUserRole as deleteUserRoleInStore } from '@/graphql/providers/user-roles/faker/dataStore';
import { ApiError } from '@/graphql/errors';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { UserRole } from '@/graphql/generated/types';

export async function deleteUserRole({ id }: DeleteUserRoleParams): Promise<DeleteUserRoleResult> {
  const deletedUserRole = deleteUserRoleInStore(id);

  if (!deletedUserRole) {
    throw new ApiError('UserRole not found', ApolloServerErrorCode.PERSISTED_QUERY_NOT_FOUND);
  }

  return deletedUserRole as UserRole; // Convert UserRoleData to UserRole for GraphQL
}
