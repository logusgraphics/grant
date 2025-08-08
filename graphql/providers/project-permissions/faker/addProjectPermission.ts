import { ProjectPermission } from '@/graphql/generated/types';
import { addProjectPermission as addProjectPermissionInStore } from '@/graphql/providers/project-permissions/faker/dataStore';

import { AddProjectPermissionParams, AddProjectPermissionResult } from '../types';

export async function addProjectPermission({
  input,
}: AddProjectPermissionParams): Promise<AddProjectPermissionResult> {
  const projectPermissionData = addProjectPermissionInStore(input.projectId, input.permissionId);
  return projectPermissionData as ProjectPermission; // Convert ProjectPermissionData to ProjectPermission for GraphQL
}
