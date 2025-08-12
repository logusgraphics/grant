import { OrganizationResolvers } from '@/graphql/generated/types';
export const organizationProjectsResolver: OrganizationResolvers['projects'] = async (
  parent,
  _args,
  context
) => {
  const organizationId = parent.id;
  const organizationProjects = await context.providers.organizationProjects.getOrganizationProjects(
    {
      organizationId,
    }
  );
  const projectIds = organizationProjects.map((op) => op.projectId);
  if (projectIds.length === 0) {
    return [];
  }
  const projectsResult = await context.providers.projects.getProjects({
    ids: projectIds,
    organizationId,
    limit: -1,
  });
  return projectsResult.projects;
};
