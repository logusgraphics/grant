import { QueryResolvers } from '@/graphql/generated/types';

export const getTagsResolver: QueryResolvers['tags'] = async (
  _parent,
  { scope, page = 1, limit = 10, sort, search, ids },
  context
) => {
  switch (scope.tenant) {
    case 'ORGANIZATION': {
      const organizationTags = await context.providers.organizationTags.getOrganizationTags({
        organizationId: scope.id,
      });
      let tagIds = organizationTags.map((ot) => ot.tagId);
      if (ids && ids.length > 0) {
        tagIds = tagIds.filter((tagId) => ids.includes(tagId));
      }
      if (tagIds.length === 0) {
        return {
          tags: [],
          totalCount: 0,
          hasNextPage: false,
        };
      }
      const tagsResult = await context.providers.tags.getTags({
        ids: tagIds,
        page,
        limit,
        sort,
        search,
        scope,
      });
      return tagsResult;
    }
    case 'PROJECT': {
      const projectTags = await context.providers.projectTags.getProjectTags({
        projectId: scope.id,
      });
      let tagIds = projectTags.map((pt) => pt.tagId);
      if (ids && ids.length > 0) {
        tagIds = tagIds.filter((tagId) => ids.includes(tagId));
      }
      if (tagIds.length === 0) {
        return {
          tags: [],
          totalCount: 0,
          hasNextPage: false,
        };
      }
      const tagsResult = await context.providers.tags.getTags({
        ids: tagIds,
        page,
        limit,
        sort,
        search,
        scope,
      });
      return tagsResult;
    }
    default:
      throw new Error(`Unsupported tenant type: ${scope.tenant}`);
  }
};
