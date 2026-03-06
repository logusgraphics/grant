import { ProjectAppResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';

export const projectAppTagsResolver: ProjectAppResolvers<GraphqlContext>['tags'] = async (
  parent,
  _args,
  context
) => {
  if (parent.tags) {
    return parent.tags;
  }

  const projectAppTags = await context.handlers.projectApps.getProjectAppTags({
    projectAppId: parent.id,
  });
  const tagIds = projectAppTags.map((pt) => pt.tagId);
  if (tagIds.length === 0) {
    return [];
  }

  const scope = context.user?.scope;
  if (!scope) {
    return [];
  }

  const { tags } = await context.handlers.tags.getTags({
    scope,
    ids: tagIds,
    limit: tagIds.length,
  });
  return tags;
};
