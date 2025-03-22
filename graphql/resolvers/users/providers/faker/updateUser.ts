import { User } from '@/graphql/generated/types';
import { UpdateUserParams, UpdateUserResult } from '../types';
import { ROLES } from '@/shared/constants/roles';
import { ValidationError } from '@/graphql/errors';
import { updateUser as updateUserInStore } from './dataStore';

export async function updateUser({ id, input }: UpdateUserParams): Promise<UpdateUserResult> {
  const updatedUser = updateUserInStore(id, input);

  if (!updatedUser) {
    throw new Error('User not found');
  }

  return updatedUser;
}
