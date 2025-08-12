import { GroupResolvers } from '@/graphql/generated/types';
export const groupTagsResolver: GroupResolvers['tags'] = async (parent, { scope }, context) => {
  const groupTags = await context.providers.groupTags.getGroupTags({
    groupId: parent.id,
    scope,
  });
  const tagIds = groupTags.map((gt) => gt.tagId);
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
