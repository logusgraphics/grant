import { QueryResolvers } from '@/graphql/generated/types';

export const getProjectsResolver: QueryResolvers['projects'] = async (
  _parent,
  { organizationId, page, limit, sort, search, ids },
  context
) => {
  // Get organization-project relationships for the specified organization
  const organizationProjects = await context.providers.organizationProjects.getOrganizationProjects(
    {
      organizationId,
    }
  );

  // Extract project IDs from organization-project relationships
  let projectIds = organizationProjects.map((op) => op.projectId);

  // Apply additional filtering if ids parameter is provided
  if (ids && ids.length > 0) {
    projectIds = projectIds.filter((projectId) => ids.includes(projectId));
  }

  if (projectIds.length === 0) {
    return {
      projects: [],
      totalCount: 0,
      hasNextPage: false,
    };
  }

  // Get projects by IDs with pagination
  const projectsResult = await context.providers.projects.getProjects({
    ids: projectIds,
    page,
    limit,
    sort,
    search,
    organizationId, // Pass the organizationId to maintain consistency
  });

  return projectsResult;
};
