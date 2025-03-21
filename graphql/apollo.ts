import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { schema } from '@/graphql/schema';
import { defaultConfig } from './config';
import { Context } from './types';

// Create the Apollo Server instance
const server = new ApolloServer<Context>({
  schema,
});

// Export the handler for the API route
export const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => ({
    req,
    providers: defaultConfig.providers,
  }),
});
