import { MutationResolvers, MutationVerifyEmailArgs } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const verifyEmail: MutationResolvers<GraphqlContext>['verifyEmail'] = async (
  _,
  args: MutationVerifyEmailArgs,
  context: GraphqlContext
) => {
  const result = await context.handlers.auth.verifyEmail(args.input.token, context.locale);
  context.requestLogger.info({ msg: 'Email verified' });
  return result;
};
