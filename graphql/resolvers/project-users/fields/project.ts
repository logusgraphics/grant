import { ProjectUserResolvers } from '@/graphql/generated/types';

export const projectUserProjectResolver: ProjectUserResolvers['project'] = async (
  parent,
  { organizationId },
  context
) => {
  // Get the project by projectId using the data store directly
  const projects = await context.providers.projects.getProjects({
    ids: [parent.projectId],
    organizationId,
    limit: -1,
  });

  const project = projects.projects[0];

  if (!project) {
    throw new Error(`Project with ID ${parent.projectId} not found`);
  }

  return project;
};
