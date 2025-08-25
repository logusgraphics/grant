import { QueryResolvers } from '@/graphql/generated/types';
export const getOrganizationTagsResolver: QueryResolvers['organizationTags'] = async (
  _parent,
  { organizationId },
  context
) => {
  const organizationTags = await context.services.organizationTags.getOrganizationTags({
    organizationId,
  });
  return organizationTags;
};
