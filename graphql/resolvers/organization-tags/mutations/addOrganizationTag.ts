import { MutationResolvers } from '@/graphql/generated/types';
export const addOrganizationTagResolver: MutationResolvers['addOrganizationTag'] = async (
  _parent,
  { input },
  context
) => {
  const organizationTag = await context.services.organizationTags.addOrganizationTag({
    input,
  });
  return organizationTag;
};
