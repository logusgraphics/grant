import { getProjectTagsByProjectId } from '@/graphql/providers/project-tags/faker/dataStore';
import { GetProjectTagsParams, GetProjectTagsResult } from '@/graphql/providers/project-tags/types';

export async function getProjectTags({
  projectId,
}: GetProjectTagsParams): Promise<GetProjectTagsResult> {
  return getProjectTagsByProjectId(projectId);
}
