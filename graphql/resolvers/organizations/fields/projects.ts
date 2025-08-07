import { OrganizationResolvers } from '@/graphql/generated/types';

export const organizationProjectsResolver: OrganizationResolvers['projects'] = async (
  parent,
  _args,
  context
) => {
  // Get organization-project relationships for this organization
  const organizationProjects = await context.providers.organizationProjects.getOrganizationProjects(
    {
      organizationId: parent.id,
    }
  );

  // Extract project IDs from organization-project relationships
  const projectIds = organizationProjects.map((op) => op.projectId);

  if (projectIds.length === 0) {
    return [];
  }

  // Get projects by IDs (optimized - no need to fetch all projects)
  const projectsResult = await context.providers.projects.getProjects({
    ids: projectIds,
  });

  return projectsResult.projects;
};
