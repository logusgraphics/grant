import { CreateUserParams, CreateUserResult } from '../types';
import { createUser as createUserInStore } from './dataStore';

export async function createUser({ input }: CreateUserParams): Promise<CreateUserResult> {
  return createUserInStore(input);
}
