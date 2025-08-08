import { getProjectRolesByProjectId } from '@/graphql/providers/project-roles/faker/dataStore';
import {
  GetProjectRolesParams,
  GetProjectRolesResult,
} from '@/graphql/providers/project-roles/types';

export async function getProjectRoles({
  projectId,
}: GetProjectRolesParams): Promise<GetProjectRolesResult> {
  return getProjectRolesByProjectId(projectId);
}
