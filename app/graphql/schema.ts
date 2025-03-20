export const typeDefs = `#graphql
  type Query {
    hello: String
    users: [User!]!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
  }

  input CreateUserInput {
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
  },
};
