import { getProjectUsersByProjectId } from '@/graphql/providers/project-users/faker/dataStore';
import {
  GetProjectUsersParams,
  GetProjectUsersResult,
} from '@/graphql/providers/project-users/types';

export async function getProjectUsers({
  projectId,
}: GetProjectUsersParams): Promise<GetProjectUsersResult> {
  return getProjectUsersByProjectId(projectId);
}
