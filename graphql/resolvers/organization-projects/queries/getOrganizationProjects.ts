import { QueryResolvers } from '@/graphql/generated/types';
export const getOrganizationProjectsResolver: QueryResolvers['organizationProjects'] = async (
  _parent,
  { organizationId },
  context
) => {
  const organizationProjects = await context.services.organizationProjects.getOrganizationProjects({
    organizationId,
  });
  return organizationProjects;
};
