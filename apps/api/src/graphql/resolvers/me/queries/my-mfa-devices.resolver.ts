import { QueryResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const myMfaDevicesResolver: QueryResolvers<GraphqlContext>['myMfaDevices'] = async (
  _,
  _args,
  context
) => {
  return context.handlers.me.myMfaDevices();
};
