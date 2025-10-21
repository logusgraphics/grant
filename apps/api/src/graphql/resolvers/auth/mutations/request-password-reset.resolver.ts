import { MutationRequestPasswordResetArgs, MutationResolvers } from '@logusgraphics/grant-schema';

import { GraphqlContext } from '@/graphql/types';

export const requestPasswordReset: MutationResolvers<GraphqlContext>['requestPasswordReset'] =
  async (_, args: MutationRequestPasswordResetArgs, context: GraphqlContext) => {
    return context.handlers.accounts.requestPasswordReset(args.input.email, context.locale);
  };
