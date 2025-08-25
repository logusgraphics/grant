import { QueryResolvers } from '@/graphql/generated/types';
import { getScopedTagIds, getScopedUserIds } from '@/graphql/lib/scopeFiltering';

export const getUserTagsResolver: QueryResolvers['userTags'] = async (
  _parent,
  { userId, scope },
  context
) => {
  const [scopedTagIds, scopedUserIds] = await Promise.all([
    getScopedTagIds({ scope, context }),
    getScopedUserIds({ scope, context }),
  ]);

  if (!scopedUserIds.includes(userId)) {
    return [];
  }

  const userTags = await context.services.userTags.getUserTags({
    userId,
  });

  const filteredUserTags = userTags.filter((ut) => scopedTagIds.includes(ut.tagId));

  return filteredUserTags;
};
