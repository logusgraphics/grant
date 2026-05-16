import { MutationResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';
import { AuthenticationError } from '@/lib/errors';

export const startProjectExportResolver: MutationResolvers<GraphqlContext>['startProjectExport'] =
  async (_parent, args, context) => {
    const enqueuedById = context.user?.userId;
    if (!enqueuedById) {
      throw new AuthenticationError('Authenticated user required to start an export job');
    }
    return context.handlers.projects.startProjectExport({ ...args, enqueuedById });
  };
