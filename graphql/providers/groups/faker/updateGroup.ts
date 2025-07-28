import { ApiError } from '@/graphql/errors';
import { UpdateGroupParams, UpdateGroupResult } from '@/graphql/providers/groups/types';
import { updateGroup as updateGroupInStore } from '@/graphql/providers/groups/faker/dataStore';
import { ApolloServerErrorCode } from '@apollo/server/errors';

export async function updateGroup({ id, input }: UpdateGroupParams): Promise<UpdateGroupResult> {
  const updatedGroupData = updateGroupInStore(id, input);

  if (!updatedGroupData) {
    throw new ApiError('Group not found', ApolloServerErrorCode.PERSISTED_QUERY_NOT_FOUND);
  }

  return { ...updatedGroupData, permissions: [] };
}
