import { MutationResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const setMyPrimaryMfaDeviceResolver: MutationResolvers<GraphqlContext>['setMyPrimaryMfaDevice'] =
  async (_parent, args, context) => {
    return context.handlers.me.setMyPrimaryMfaDevice(args.input.factorId);
  };
