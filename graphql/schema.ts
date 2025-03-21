import { makeExecutableSchema } from '@graphql-tools/schema';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as userQueries from './users/queries';
import * as userMutations from './users/mutations';
import * as authMutations from './auth/mutations';

// Read the GraphQL schema file
const typeDefs = readFileSync(join(process.cwd(), 'graphql/schema.graphql'), 'utf-8');

// Define resolvers with proper typing
const resolvers = {
  Query: {
    users: userQueries.getUsers,
  },
  Mutation: {
    createUser: userMutations.createUser,
    updateUser: userMutations.updateUser,
    deleteUser: userMutations.deleteUser,
    login: authMutations.login,
  },
} as const;

// Create and export the executable schema
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
