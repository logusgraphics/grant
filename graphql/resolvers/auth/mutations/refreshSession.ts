import { MutationRefreshSessionArgs, MutationResolvers } from '@/graphql/generated/types';
import { GraphqlContext } from '@/graphql/types';

export const refreshSession: MutationResolvers['refreshSession'] = async (
  _: any,
  args: MutationRefreshSessionArgs,
  context: GraphqlContext
) => {
  return context.controllers.accounts.refreshSession(args);
};
