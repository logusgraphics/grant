import { PermissionResolvers } from '@/graphql/generated/types';
export const permissionTagsResolver: PermissionResolvers['tags'] = async (
  parent,
  { scope },
  context
) => {
  const permissionTags = await context.providers.permissionTags.getPermissionTags({
    permissionId: parent.id,
    scope,
  });
  const tagIds = permissionTags.map((pt) => pt.tagId);
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
