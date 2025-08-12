import { RoleResolvers } from '@/graphql/generated/types';
export const roleTagsResolver: RoleResolvers['tags'] = async (parent, { scope }, context) => {
  const roleTags = await context.providers.roleTags.getRoleTags({
    roleId: parent.id,
    scope,
  });
  const tagIds = roleTags.map((rt) => rt.tagId);
  if (tagIds.length === 0) {
    return [];
  }
  const tagsResult = await context.providers.tags.getTags({
    ids: tagIds,
    scope,
    limit: -1,
  });
  return tagsResult.tags;
};
