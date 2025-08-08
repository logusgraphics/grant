import { ProjectGroup } from '@/graphql/generated/types';
import { addProjectGroup as addProjectGroupInStore } from '@/graphql/providers/project-groups/faker/dataStore';

import { AddProjectGroupParams, AddProjectGroupResult } from '../types';

export async function addProjectGroup({
  input,
}: AddProjectGroupParams): Promise<AddProjectGroupResult> {
  const projectGroupData = addProjectGroupInStore(input.projectId, input.groupId);
  return projectGroupData as ProjectGroup; // Convert ProjectGroupData to ProjectGroup for GraphQL
}
