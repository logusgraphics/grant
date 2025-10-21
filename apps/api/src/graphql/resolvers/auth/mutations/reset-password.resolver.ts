import { MutationResetPasswordArgs, MutationResolvers } from '@logusgraphics/grant-schema';

import { GraphqlContext } from '@/graphql/types';

export const resetPassword: MutationResolvers<GraphqlContext>['resetPassword'] = async (
  _,
  args: MutationResetPasswordArgs,
  context: GraphqlContext
) => {
  return context.handlers.accounts.resetPassword(
    args.input.token,
    args.input.newPassword,
    context.locale
  );
};
