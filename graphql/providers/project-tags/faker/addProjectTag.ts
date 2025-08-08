import { addProjectTag as addProjectTagToStore } from '@/graphql/providers/project-tags/faker/dataStore';
import { AddProjectTagParams, AddProjectTagResult } from '@/graphql/providers/project-tags/types';

export async function addProjectTag({ input }: AddProjectTagParams): Promise<AddProjectTagResult> {
  const projectTag = addProjectTagToStore(input.projectId, input.tagId);
  return projectTag as AddProjectTagResult;
}
