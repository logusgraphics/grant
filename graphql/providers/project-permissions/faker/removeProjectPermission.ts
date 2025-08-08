import { deleteProjectPermissionByProjectAndPermission } from '@/graphql/providers/project-permissions/faker/dataStore';

import { RemoveProjectPermissionParams, RemoveProjectPermissionResult } from '../types';

export async function removeProjectPermission({
  input,
}: RemoveProjectPermissionParams): Promise<RemoveProjectPermissionResult> {
  const deletedProjectPermission = deleteProjectPermissionByProjectAndPermission(
    input.projectId,
    input.permissionId
  );
  return deletedProjectPermission !== null;
}
