import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

import { providers } from '@/graphql/config/providers';
import { createServices } from '@/graphql/config/services';
import { schema } from '@/graphql/resolvers';
import { Context, AuthenticatedUser } from '@/graphql/types';

const server = new ApolloServer<Context>({
  schema,
});

export const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => {
    let user: AuthenticatedUser | undefined;

    const services = createServices({ user: user || null });

    return {
      req,
      providers,
      services,
      user,
    };
  },
});
