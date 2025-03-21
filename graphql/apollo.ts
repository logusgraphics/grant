import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { schema } from '@/graphql/schema';

// Create the Apollo Server instance
const server = new ApolloServer({
  schema,
});

// Export the handler for the API route
export const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => ({ req }),
});
