import { MutationResolvers } from '@/graphql/generated/types';

export const createOrganizationResolver: MutationResolvers['createOrganization'] = async (
  _parent,
  { input },
  context
) => {
  const createdOrganization = await context.controllers.organizations.createOrganization({ input });
  return createdOrganization;
};
