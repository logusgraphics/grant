import { MutationResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const removeMyMfaDeviceResolver: MutationResolvers<GraphqlContext>['removeMyMfaDevice'] =
  async (_parent, args, context) => {
    const success = await context.handlers.me.removeMyMfaDevice(args.input.factorId);
    return { success };
  };
