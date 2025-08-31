import { MutationResolvers } from '@/graphql/generated/types';

export const updateProjectResolver: MutationResolvers['updateProject'] = async (
  _parent,
  { id, input },
  context
) => {
  const updatedProject = await context.controllers.projects.updateProject({ id, input });
  return updatedProject;
};
