import { faker } from '@faker-js/faker';
import { User } from '@/graphql/generated/types';
import { CreateUserParams, CreateUserResult } from '../types';
import { ROLES } from '@/shared/constants/roles';

export async function createUser({ input }: CreateUserParams): Promise<CreateUserResult> {
  const newUser: User = {
    id: faker.string.uuid(),
    ...input,
    roles: input.roleIds
      ?.map((id) => ROLES.find((role) => role.id === id))
      .filter((role): role is (typeof ROLES)[0] => role !== undefined) || [
      { id: 'customer', label: 'roles.customer' },
    ],
  };

  return newUser;
}
