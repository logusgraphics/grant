import { QueryResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const myMfaRecoveryCodeStatus: QueryResolvers<GraphqlContext>['myMfaRecoveryCodeStatus'] =
  async (_parent, _args, context) => {
    return context.handlers.me.myMfaRecoveryCodeStatus();
  };
