import { MutationResolvers } from '@/graphql/generated/types';

export const removeProjectRoleResolver: MutationResolvers['removeProjectRole'] = async (
  _parent,
  { input },
  context
) => {
  const success = await context.providers.projectRoles.removeProjectRole({
    input,
  });
  return success;
};
