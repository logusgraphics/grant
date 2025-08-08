import { ProjectRole } from '@/graphql/generated/types';
import { addProjectRole as addProjectRoleInStore } from '@/graphql/providers/project-roles/faker/dataStore';

import { AddProjectRoleParams, AddProjectRoleResult } from '../types';

export async function addProjectRole({
  input,
}: AddProjectRoleParams): Promise<AddProjectRoleResult> {
  const projectRoleData = addProjectRoleInStore(input.projectId, input.roleId);
  return projectRoleData as ProjectRole; // Convert ProjectRoleData to ProjectRole for GraphQL
}
