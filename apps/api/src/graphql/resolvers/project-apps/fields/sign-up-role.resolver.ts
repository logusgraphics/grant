import { ProjectAppResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const projectAppSignUpRoleResolver: ProjectAppResolvers<GraphqlContext>['signUpRole'] =
  async (parent, _args, context) => {
    const signUpRoleId = (parent as { signUpRoleId?: string | null }).signUpRoleId;
    if (!signUpRoleId) return null;
    return context.handlers.roles.getRoleById(signUpRoleId);
  };
