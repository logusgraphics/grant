import { deleteProjectTagByProjectAndTag } from '@/graphql/providers/project-tags/faker/dataStore';
import {
  RemoveProjectTagParams,
  RemoveProjectTagResult,
} from '@/graphql/providers/project-tags/types';

export async function removeProjectTag({
  input,
}: RemoveProjectTagParams): Promise<RemoveProjectTagResult> {
  const deletedProjectTag = deleteProjectTagByProjectAndTag(input.projectId, input.tagId);
  return deletedProjectTag !== null;
}
