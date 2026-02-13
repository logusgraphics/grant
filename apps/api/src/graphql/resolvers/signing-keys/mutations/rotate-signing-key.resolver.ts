import { MutationResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const rotateSigningKeyResolver: MutationResolvers<GraphqlContext>['rotateSigningKey'] =
  async (_parent, { scope }, context) => {
    return context.handlers.signingKeys.rotateSigningKey(scope);
  };
