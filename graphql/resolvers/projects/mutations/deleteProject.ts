import { MutationResolvers } from '@/graphql/generated/types';

export const deleteProjectResolver: MutationResolvers['deleteProject'] = async (
  _parent,
  { id, organizationId },
  context
) => {
  const deletedProject = await context.controllers.projects.deleteProject({ id, organizationId });
  return deletedProject;
};
