import { MutationResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';
import { AuthenticationError } from '@/lib/errors';

export const startProjectSyncResolver: MutationResolvers<GraphqlContext>['startProjectSync'] =
  async (_parent, args, context) => {
    const enqueuedById = context.user?.userId;
    if (!enqueuedById) {
      throw new AuthenticationError('Authenticated user required to start a sync job');
    }
    return context.handlers.projects.startProjectSync({ ...args, enqueuedById });
  };
