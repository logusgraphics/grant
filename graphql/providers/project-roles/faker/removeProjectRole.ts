import { deleteProjectRoleByProjectAndRole } from '@/graphql/providers/project-roles/faker/dataStore';

import { RemoveProjectRoleParams, RemoveProjectRoleResult } from '../types';

export async function removeProjectRole({
  input,
}: RemoveProjectRoleParams): Promise<RemoveProjectRoleResult> {
  const deletedProjectRole = deleteProjectRoleByProjectAndRole(input.projectId, input.roleId);
  return deletedProjectRole !== null;
}
