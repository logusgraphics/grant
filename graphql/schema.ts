export const typeDefs = `#graphql
  type Query {
    hello: String
    users(page: Int!, limit: Int!): UserConnection!
  }

  type UserConnection {
    users: [User!]!
    totalCount: Int!
    hasNextPage: Boolean!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): User!
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  input UpdateUserInput {
    name: String!
    email: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
  }
`;

interface User {
  id: string;
  name: string;
  email: string;
}

interface CreateUserInput {
  name: string;
  email: string;
}

interface UpdateUserInput {
  name: string;
  email: string;
}

// Generate 30 users with realistic names and emails
const users: User[] = Array.from({ length: 30 }, (_, index) => {
  const firstName = [
    'John',
    'Jane',
    'Michael',
    'Sarah',
    'David',
    'Emma',
    'James',
    'Olivia',
    'Robert',
    'Sophia',
    'William',
    'Isabella',
    'Thomas',
    'Mia',
    'Daniel',
    'Charlotte',
    'Joseph',
    'Amelia',
    'Henry',
    'Harper',
    'Sebastian',
    'Evelyn',
    'Jack',
    'Abigail',
    'Owen',
    'Emily',
    'Gabriel',
    'Elizabeth',
    'Matthew',
    'Sofia',
  ][index];

  const lastName = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Rodriguez',
    'Martinez',
    'Hernandez',
    'Lopez',
    'Gonzalez',
    'Wilson',
    'Anderson',
    'Thomas',
    'Taylor',
    'Moore',
    'Jackson',
    'Martin',
    'Lee',
    'Perez',
    'Thompson',
    'White',
    'Harris',
    'Sanchez',
    'Clark',
    'Ramirez',
    'Lewis',
    'Robinson',
  ][index];

  return {
    id: `${index + 1}`,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
  };
});

function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const resolvers = {
  Query: {
    hello: () => 'Hello from Apollo Server!',
    users: (
      _: unknown,
      { page, limit }: { page: number; limit: number }
    ): { users: User[]; totalCount: number; hasNextPage: boolean } => {
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedUsers = users.slice(start, end);

      return {
        users: paginatedUsers,
        totalCount: users.length,
        hasNextPage: end < users.length,
      };
    },
  },
  Mutation: {
    createUser: (_: unknown, { input }: { input: CreateUserInput }): User => {
      const newUser = {
        id: generateUniqueId(),
        ...input,
      };
      users.push(newUser);
      return newUser;
    },
    updateUser: (_: unknown, { id, input }: { id: string; input: UpdateUserInput }): User => {
      const index = users.findIndex((user) => user.id === id);
      if (index === -1) {
        throw new Error('User not found');
      }
      users[index] = { ...users[index], ...input };
      return users[index];
    },
    deleteUser: (_: unknown, { id }: { id: string }): User => {
      const index = users.findIndex((user) => user.id === id);
      if (index === -1) {
        throw new Error('User not found');
      }
      const [deletedUser] = users.splice(index, 1);
      return deletedUser;
    },
  },
};
