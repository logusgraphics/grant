import { MutationResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';
import { AuthenticationError } from '@/lib/errors';

export const setupMfa: MutationResolvers<GraphqlContext>['setupMfa'] = async (
  _,
  _args,
  context
) => {
  const userId = context.user?.userId;
  if (!userId) {
    throw new AuthenticationError('Unauthorized');
  }
  const me = await context.handlers.me.getMe();
  const accountLabel = me.email?.trim() || userId;
  return context.handlers.auth.setupMfa(userId, accountLabel);
};
