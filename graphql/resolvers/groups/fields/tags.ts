import { GroupResolvers } from '@/graphql/generated/types';
import { getScopedTagIds } from '@/graphql/lib/scopeFiltering';

export const groupTagsResolver: GroupResolvers['tags'] = async (parent, { scope }, context) => {
  const groupTags = await context.services.groupTags.getGroupTags({
    groupId: parent.id,
  });

  const tagIds = groupTags.map((gt) => gt.tagId);

  if (tagIds.length === 0) {
    return [];
  }

  const scopedTagIds = await getScopedTagIds({ scope, context });
  const accessibleTagIds = tagIds.filter((id) => scopedTagIds.includes(id));

  if (accessibleTagIds.length === 0) {
    return [];
  }

  const tagsResult = await context.services.tags.getTags({
    ids: accessibleTagIds,
    limit: -1,
  });

  return tagsResult.tags;
};
