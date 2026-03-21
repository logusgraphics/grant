import { MutationResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const verifyMyMfaEnrollmentResolver: MutationResolvers<GraphqlContext>['verifyMyMfaEnrollment'] =
  async (_parent, args, context) => {
    const success = await context.handlers.me.verifyMyMfaEnrollment(args.input.code);
    return { success };
  };
