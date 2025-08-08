import { ProjectResolvers } from '@/graphql/generated/types';

export const projectTagsResolver: ProjectResolvers['tags'] = async (
  parent: any,
  _args: any,
  context: any
) => {
  // Get project-tag relationships for this project
  const projectTags = await context.providers.projectTags.getProjectTags({ projectId: parent.id });

  // Extract tag IDs from project-tag relationships
  const tagIds = projectTags.map((pt: any) => pt.tagId);

  if (tagIds.length === 0) {
    return [];
  }

  // Get tags by IDs (optimized - no need to fetch all tags)
  const tagsResult = await context.providers.tags.getTags({
    ids: tagIds,
  });

  return tagsResult.tags;
};
