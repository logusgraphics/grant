import { ProjectPermissionResolvers } from '@/graphql/generated/types';

export const projectPermissionProjectResolver: ProjectPermissionResolvers['project'] = async (
  parent,
  _args,
  context
) => {
  // Get the project by projectId (optimized - no need to fetch all projects)
  const projectsResult = await context.providers.projects.getProjects({
    ids: [parent.projectId],
  });

  const project = projectsResult.projects[0];

  if (!project) {
    throw new Error(`Project with ID ${parent.projectId} not found`);
  }

  return project;
};
