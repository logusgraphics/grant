import { ProjectGroupResolvers } from '@/graphql/generated/types';

export const projectGroupProjectResolver: ProjectGroupResolvers['project'] = async (
  parent,
  { organizationId },
  context
) => {
  const projectsResult = await context.providers.projects.getProjects({
    ids: [parent.projectId],
    organizationId,
    limit: -1,
  });

  const project = projectsResult.projects[0];

  if (!project) {
    throw new Error(`Project with ID ${parent.projectId} not found`);
  }

  return project;
};
