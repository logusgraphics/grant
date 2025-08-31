import { MutationResolvers } from '@/graphql/generated/types';

export const deleteProjectResolver: MutationResolvers['deleteProject'] = async (
  _parent,
  { id },
  context
) => {
  const deletedProject = await context.controllers.projects.deleteProject({ id });
  return deletedProject;
};
