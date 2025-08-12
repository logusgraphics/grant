import { MutationResolvers } from '@/graphql/generated/types';
export const addProjectRoleResolver: MutationResolvers['addProjectRole'] = async (
  _parent,
  { input },
  context
) => {
  const projectRole = await context.providers.projectRoles.addProjectRole({
    input,
  });
  return projectRole;
};
