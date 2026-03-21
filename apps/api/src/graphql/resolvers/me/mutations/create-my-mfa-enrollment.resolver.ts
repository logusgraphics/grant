import { MutationResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const createMyMfaEnrollmentResolver: MutationResolvers<GraphqlContext>['createMyMfaEnrollment'] =
  async (_parent, _args, context) => {
    return context.handlers.me.createMyMfaEnrollment();
  };
