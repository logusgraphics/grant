import { MutationResolvers } from '@logusgraphics/grant-schema';

import { GraphqlContext } from '@/graphql/types';

export const register: MutationResolvers<GraphqlContext>['register'] = async (_, args, context) => {
  const { name, username, type, provider, providerId, providerData } = args.input;
  const { origin: audience, locale } = context;
  return context.handlers.accounts.createAccount(
    {
      name,
      username,
      type,
      provider,
      providerId,
      providerData,
    },
    audience,
    locale
  );
};
