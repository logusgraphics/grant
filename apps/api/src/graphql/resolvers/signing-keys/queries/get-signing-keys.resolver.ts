import { QueryResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const getSigningKeysResolver: QueryResolvers<GraphqlContext>['signingKeys'] = async (
  _parent,
  { scope },
  context
) => {
  return context.handlers.signingKeys.getSigningKeys(scope);
};
