import { QueryResolvers } from '@/graphql/generated/types';

export const getOrganizationProjectsResolver: QueryResolvers['organizationProjects'] = async (
  _parent,
  { organizationId },
  context
) => {
  const organizationProjects = await context.providers.organizationProjects.getOrganizationProjects(
    { organizationId }
  );
  return organizationProjects;
};
