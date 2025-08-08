import { OrganizationResolvers } from '@/graphql/generated/types';

export const organizationProjectsResolver: OrganizationResolvers['projects'] = async (
  parent,
  _args,
  context
) => {
  const organizationId = parent.id;
  // Get organization-project relationships for this organization
  const organizationProjects = await context.providers.organizationProjects.getOrganizationProjects(
    {
      organizationId,
    }
  );

  // Extract project IDs from organization-project relationships
  const projectIds = organizationProjects.map((op) => op.projectId);

  if (projectIds.length === 0) {
    return [];
  }

  // Get all projects with limit -1
  const projectsResult = await context.providers.projects.getProjects({
    ids: projectIds,
    organizationId,
    limit: -1,
  });

  return projectsResult.projects;
};
