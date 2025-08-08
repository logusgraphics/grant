import { deleteProjectGroupByProjectAndGroup } from '@/graphql/providers/project-groups/faker/dataStore';

import { RemoveProjectGroupParams, RemoveProjectGroupResult } from '../types';

export async function removeProjectGroup({
  input,
}: RemoveProjectGroupParams): Promise<RemoveProjectGroupResult> {
  const deletedProjectGroup = deleteProjectGroupByProjectAndGroup(input.projectId, input.groupId);
  return deletedProjectGroup !== null;
}
