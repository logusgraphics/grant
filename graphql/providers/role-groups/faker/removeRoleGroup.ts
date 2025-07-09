import {
  RemoveRoleGroupParams,
  RemoveRoleGroupResult,
} from '@/graphql/providers/role-groups/types';
import { deleteRoleGroupByGroupAndRole } from '@/graphql/providers/role-groups/faker/dataStore';
import { ApiError } from '@/graphql/errors';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { RoleGroup } from '@/graphql/generated/types';

export async function removeRoleGroup({
  input,
}: RemoveRoleGroupParams): Promise<RemoveRoleGroupResult> {
  const deletedRoleGroup = deleteRoleGroupByGroupAndRole(input.groupId, input.roleId);

  if (!deletedRoleGroup) {
    throw new ApiError('RoleGroup not found', ApolloServerErrorCode.PERSISTED_QUERY_NOT_FOUND);
  }

  return deletedRoleGroup as RoleGroup; // Convert RoleGroupData to RoleGroup for GraphQL
}
