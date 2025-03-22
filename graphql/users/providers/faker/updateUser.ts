import { User } from '@/graphql/generated/types';
import { UpdateUserParams, UpdateUserResult } from '../types';
import { ROLES } from '@/shared/constants/roles';
import { ValidationError } from '@/graphql/errors';

export async function updateUser({ id, input }: UpdateUserParams): Promise<UpdateUserResult> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email)) {
    throw new ValidationError('Invalid email format');
  }

  const updatedUser: User = {
    id,
    name: input.name,
    email: input.email,
    roles: input.roleIds
      ?.map((roleId) => ROLES.find((role) => role.id === roleId))
      .filter((role): role is (typeof ROLES)[0] => role !== undefined) || [
      { id: 'customer', label: 'roles.customer' },
    ],
  };

  return updatedUser;
}
