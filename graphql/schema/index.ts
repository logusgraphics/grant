import { loadFilesSync } from '@graphql-tools/load-files';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { join } from 'path';
import { Query } from '@/graphql/resolvers/queries';
import { Mutation } from '@/graphql/resolvers/mutations';
import { User } from '@/graphql/resolvers/users/fields';
import { UserRole } from '@/graphql/resolvers/user-roles/fields';

// Load all schema files
const typeDefs = loadFilesSync(join(process.cwd(), 'graphql/schema'), {
  extensions: ['graphql'],
  ignoreIndex: true,
});

// Create the schema
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query,
    Mutation,
    User,
    UserRole,
  },
});
