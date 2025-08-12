import { ProjectResolvers, Tenant } from '@/graphql/generated/types';
export const projectTagsResolver: ProjectResolvers['tags'] = async (parent, _args, context) => {
  const projectId = parent.id;
  const projectTags = await context.providers.projectTags.getProjectTags({ projectId });
  const tagIds = projectTags.map((pt) => pt.tagId);
  if (tagIds.length === 0) {
    return [];
  }
  const tagsResult = await context.providers.tags.getTags({
    ids: tagIds,
    scope: {
      tenant: Tenant.Project,
      id: projectId,
    },
    limit: -1,
  });
  return tagsResult.tags;
};
