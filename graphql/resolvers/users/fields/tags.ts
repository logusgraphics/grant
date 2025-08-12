import { UserResolvers } from '@/graphql/generated/types';
export const userTagsResolver: UserResolvers['tags'] = async (parent, { scope }, context) => {
  const userTags = await context.providers.userTags.getUserTags({
    userId: parent.id,
    scope,
  });
  const tagIds = userTags.map((ut) => ut.tagId);
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
