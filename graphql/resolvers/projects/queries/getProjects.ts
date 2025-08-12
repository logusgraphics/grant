import { QueryResolvers } from '@/graphql/generated/types';
export const getProjectsResolver: QueryResolvers['projects'] = async (
  _parent,
  { organizationId, page, limit, sort, search, ids },
  context
) => {
  const organizationProjects = await context.providers.organizationProjects.getOrganizationProjects(
    {
      organizationId,
    }
  );
  let projectIds = organizationProjects.map((op) => op.projectId);
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
  const projectsResult = await context.providers.projects.getProjects({
    ids: projectIds,
    page,
    limit,
    sort,
    search,
    organizationId,
  });
  return projectsResult;
};
