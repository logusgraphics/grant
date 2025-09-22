import { MutationResolvers } from '@/graphql/generated/types';

export const deleteProjectResolver: MutationResolvers['deleteProject'] = async (
  _parent,
  { id, scope },
  context
) => {
  const deletedProject = await context.controllers.projects.deleteProject({ id, scope });
  return deletedProject;
};
