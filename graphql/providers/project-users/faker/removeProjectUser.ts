import { deleteProjectUserByProjectAndUser } from '@/graphql/providers/project-users/faker/dataStore';

import { RemoveProjectUserParams, RemoveProjectUserResult } from '../types';

export async function removeProjectUser({
  input,
}: RemoveProjectUserParams): Promise<RemoveProjectUserResult> {
  const deletedProjectUser = deleteProjectUserByProjectAndUser(input.projectId, input.userId);
  return deletedProjectUser !== null;
}
