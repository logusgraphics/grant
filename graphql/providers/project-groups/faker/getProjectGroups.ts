import { getProjectGroupsByProjectId } from '@/graphql/providers/project-groups/faker/dataStore';
import {
  GetProjectGroupsParams,
  GetProjectGroupsResult,
} from '@/graphql/providers/project-groups/types';

export async function getProjectGroups({
  projectId,
}: GetProjectGroupsParams): Promise<GetProjectGroupsResult> {
  return getProjectGroupsByProjectId(projectId);
}
