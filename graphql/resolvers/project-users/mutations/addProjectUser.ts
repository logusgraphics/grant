import { MutationResolvers } from '@/graphql/generated/types';
export const addProjectUserResolver: MutationResolvers['addProjectUser'] = async (
  _parent,
  { input },
  context
) => {
  const projectUser = await context.services.projectUsers.addProjectUser({
    input,
  });
  return projectUser;
};
