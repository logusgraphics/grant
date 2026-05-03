import { MutationResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';
import { AuthenticationError } from '@/lib/errors';
export const updateUserResolver: MutationResolvers<GraphqlContext>['updateUser'] = async (
  _parent,
  { id, input },
  context
) => {
  const actorUserId = context.user?.userId;
  if (!actorUserId) {
    throw new AuthenticationError('Authentication required');
  }
  const updatedUser = await context.handlers.users.updateUser({ id, input, actorUserId });
  return updatedUser;
};
