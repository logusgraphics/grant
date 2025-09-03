import { join } from 'path';

import { loadFilesSync } from '@graphql-tools/load-files';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { Mutation } from '@/graphql/resolvers/mutations';
import { Query } from '@/graphql/resolvers/queries';
import { DateScalar } from '@/graphql/resolvers/scalars';

const typeDefs = loadFilesSync(join(process.cwd(), 'graphql/schema'), {
  extensions: ['graphql'],
  ignoreIndex: true,
});

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    Date: DateScalar,
    Query,
    Mutation,
  },
});
