import { MutationResolvers } from '@logusgraphics/grant-schema';

import { GraphqlContext } from '@/graphql/types';
export const createRoleResolver: MutationResolvers<GraphqlContext>['createRole'] = async (
  _parent,
  { input },
  context
) => {
  const createdRole = await context.handlers.roles.createRole({ input });
  return createdRole;
};
