import { IProjectRepository } from '@/graphql/repositories/projects/interface';
import { AuthenticatedUser } from '@/graphql/types';

import { ProjectService } from './service';

export * from './interface';
export * from './service';
export * from './schemas';

export function createProjectService(
  projectRepository: IProjectRepository,
  user: AuthenticatedUser | null
) {
  return new ProjectService(projectRepository, user);
}
