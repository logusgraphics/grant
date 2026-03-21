import { MutationResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const generateMyMfaRecoveryCodesResolver: MutationResolvers<GraphqlContext>['generateMyMfaRecoveryCodes'] =
  async (_parent, args, context) => {
    return context.handlers.me.generateMyMfaRecoveryCodes(args.input?.factorId ?? null);
  };
