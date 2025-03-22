import { User } from '@/graphql/generated/types';
import { DeleteUserParams, DeleteUserResult } from '../types';

export async function deleteUser({ id }: DeleteUserParams): Promise<DeleteUserResult> {
  // In a real implementation, we would delete from database
  // For faker, we just return a mock deleted user
  const deletedUser: User = {
    id,
    name: 'Deleted User',
    email: 'deleted@example.com',
    roles: [{ id: 'customer', label: 'roles.customer' }],
  };

  return deletedUser;
}
