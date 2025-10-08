import { MutationResolvers } from '@logusgraphics/grant-schema';

import { GraphqlContext } from '@/graphql/types';

export const register: MutationResolvers<GraphqlContext>['register'] = async (_, args, context) => {
  const { name, username, type, provider, providerId, providerData } = args.input;
  const audience = context.origin;
  return context.controllers.accounts.createAccount(
    {
      name,
      username,
      type,
      provider,
      providerId,
      providerData,
    },
    audience
  );
};
