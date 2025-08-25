import { MutationResolvers } from '@/graphql/generated/types';
export const addOrganizationUserResolver: MutationResolvers['addOrganizationUser'] = async (
  _parent,
  { input },
  context
) => {
  const organizationUser = await context.services.organizationUsers.addOrganizationUser({
    input,
  });
  return organizationUser;
};
