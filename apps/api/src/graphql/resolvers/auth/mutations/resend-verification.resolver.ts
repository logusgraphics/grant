import { MutationResendVerificationArgs, MutationResolvers } from '@logusgraphics/grant-schema';

import { GraphqlContext } from '@/graphql/types';

export const resendVerification: MutationResolvers<GraphqlContext>['resendVerification'] = async (
  _,
  args: MutationResendVerificationArgs,
  context: GraphqlContext
) => {
  return context.handlers.accounts.resendVerificationEmail(args.input.email, context.locale);
};
