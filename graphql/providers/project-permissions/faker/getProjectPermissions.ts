import { getProjectPermissionsByProjectId } from '@/graphql/providers/project-permissions/faker/dataStore';
import {
  GetProjectPermissionsParams,
  GetProjectPermissionsResult,
} from '@/graphql/providers/project-permissions/types';

export async function getProjectPermissions({
  projectId,
}: GetProjectPermissionsParams): Promise<GetProjectPermissionsResult> {
  return getProjectPermissionsByProjectId(projectId);
}
