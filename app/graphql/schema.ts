export const typeDefs = `#graphql
  type Query {
    hello: String
    users: [User!]!
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

const users: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
];

export const resolvers = {
  Query: {
    hello: () => 'Hello from Apollo Server!',
    users: () => users,
  },
  Mutation: {
    createUser: (_: unknown, { input }: { input: CreateUserInput }): User => {
      const newUser = {
        id: String(users.length + 1),
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
