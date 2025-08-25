import { UserTagResolvers } from '@/graphql/generated/types';
import { getScopedTagIds } from '@/graphql/lib/scopeFiltering';

export const userTagTagResolver: UserTagResolvers['tag'] = async (parent, { scope }, context) => {
  const scopedTagIds = await getScopedTagIds({ scope, context });

  if (!scopedTagIds.includes(parent.tagId)) {
    throw new Error(`Tag with ID ${parent.tagId} is not accessible in the current scope`);
  }

  const tagsResult = await context.services.tags.getTags({
    ids: [parent.tagId],
  });

  const tag = tagsResult.tags[0];

  if (!tag) {
    throw new Error(`Tag with ID ${parent.tagId} not found`);
  }

  return tag;
};
