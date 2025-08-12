import { OrganizationResolvers, Tenant } from '@/graphql/generated/types';
export const organizationTagsResolver: OrganizationResolvers['tags'] = async (
  parent,
  _args,
  context
) => {
  const organizationId = parent.id;
  const organizationTags = await context.providers.organizationTags.getOrganizationTags({
    organizationId,
  });
  const tagIds = organizationTags.map((ot) => ot.tagId);
  if (tagIds.length === 0) {
    return [];
  }
  const tagsResult = await context.providers.tags.getTags({
    ids: tagIds,
    scope: {
      tenant: Tenant.Organization,
      id: organizationId,
    },
    limit: -1,
  });
  return tagsResult.tags;
};
