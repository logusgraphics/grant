import { faker } from '@faker-js/faker';
import { User } from '@/graphql/generated/types';
import { GetUsersParams, GetUsersResult } from '../types';
import { ROLES } from '@/graphql/users/constants';

export async function getUsers({ page, limit }: GetUsersParams): Promise<GetUsersResult> {
  // Generate fake users based on page and limit
  const totalCount = 100; // Mock total count
  const startIndex = (page - 1) * limit;
  const hasNextPage = startIndex + limit < totalCount;

  const users: User[] = Array.from({ length: Math.min(limit, totalCount - startIndex) }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    roles: [ROLES[Math.floor(Math.random() * ROLES.length)]],
  }));

  return {
    users,
    totalCount,
    hasNextPage,
  };
}
