import { OrganizationResolvers, Tenant } from '@/graphql/generated/types';
import { getScopedTagIds } from '@/graphql/lib/scopeFiltering';

export const organizationTagsResolver: OrganizationResolvers['tags'] = async (
  parent,
  _args,
  context
) => {
  const organizationId = parent.id;

  const organizationTags = await context.services.organizationTags.getOrganizationTags({
    organizationId,
  });

  const tagIds = organizationTags.map((ot) => ot.tagId);

  if (tagIds.length === 0) {
    return [];
  }

  const scope = { tenant: Tenant.Organization, id: organizationId };
  const scopedTagIds = await getScopedTagIds({ scope, context });

  const filteredTagIds = tagIds.filter((tagId) => scopedTagIds.includes(tagId));

  if (filteredTagIds.length === 0) {
    return [];
  }

  const tagsResult = await context.services.tags.getTags({
    ids: filteredTagIds,
    limit: -1,
  });

  return tagsResult.tags;
};
