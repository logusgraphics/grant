import { ProjectUser } from '@/graphql/generated/types';
import { addProjectUser as addProjectUserInStore } from '@/graphql/providers/project-users/faker/dataStore';

import { AddProjectUserParams, AddProjectUserResult } from '../types';

export async function addProjectUser({
  input,
}: AddProjectUserParams): Promise<AddProjectUserResult> {
  const projectUserData = addProjectUserInStore(input.projectId, input.userId);
  return projectUserData as ProjectUser; // Convert ProjectUserData to ProjectUser for GraphQL
}
