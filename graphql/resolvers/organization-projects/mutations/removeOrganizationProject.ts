import { MutationResolvers } from '@/graphql/generated/types';

export const removeOrganizationProjectResolver: MutationResolvers['removeOrganizationProject'] =
  async (_parent, { input }, context) => {
    const removedOrganizationProject =
      await context.providers.organizationProjects.removeOrganizationProject({ input });
    return removedOrganizationProject;
  };
