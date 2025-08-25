import { UserResolvers } from '@/graphql/generated/types';
import { getScopedTagIds } from '@/graphql/lib/scopeFiltering';

export const userTagsResolver: UserResolvers['tags'] = async (parent, { scope }, context) => {
  const userTags = await context.services.userTags.getUserTags({
    userId: parent.id,
  });

  if (userTags.length === 0) {
    return [];
  }

  const scopedTagIds = await getScopedTagIds({ scope, context });

  const filteredUserTags = userTags.filter((ut) => scopedTagIds.includes(ut.tagId));

  if (filteredUserTags.length === 0) {
    return [];
  }

  const filteredTagIds = filteredUserTags.map((ut) => ut.tagId);

  const tagsResult = await context.services.tags.getTags({
    ids: filteredTagIds,
    limit: -1,
  });

  return tagsResult.tags;
};
