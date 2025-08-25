import { QueryResolvers } from '@/graphql/generated/types';
import { getScopedTagIds, getScopedGroupIds } from '@/graphql/lib/scopeFiltering';

export const getGroupTagsResolver: QueryResolvers['groupTags'] = async (
  _parent,
  { groupId, scope },
  context
) => {
  const [scopedTagIds, scopedGroupIds] = await Promise.all([
    getScopedTagIds({ scope, context }),
    getScopedGroupIds({ scope, context }),
  ]);

  if (!scopedGroupIds.includes(groupId)) {
    return [];
  }

  const groupTags = await context.services.groupTags.getGroupTags({
    groupId,
  });

  const filteredGroupTags = groupTags.filter((gt) => scopedTagIds.includes(gt.tagId));

  return filteredGroupTags;
};
