import { User } from '@/graphql/generated/types';
import { DeleteUserParams, DeleteUserResult } from '../types';
import { deleteUser as deleteUserFromStore } from './dataStore';

export async function deleteUser({ id }: DeleteUserParams): Promise<DeleteUserResult> {
  const deletedUser = deleteUserFromStore(id);

  if (!deletedUser) {
    throw new Error('User not found');
  }

  return deletedUser;
}
