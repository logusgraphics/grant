import { MutationResolvers } from '@/graphql/generated/types';
export const addOrganizationProjectResolver: MutationResolvers['addOrganizationProject'] = async (
  _parent,
  { input },
  context
) => {
  const addedOrganizationProject =
    await context.providers.organizationProjects.addOrganizationProject({ input });
  return addedOrganizationProject;
};
