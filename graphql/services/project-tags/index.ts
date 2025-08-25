import { IProjectRepository, ITagRepository, IProjectTagRepository } from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { ProjectTagService } from './service';

export * from './interface';
export * from './service';
export * from './schemas';

export function createProjectTagService(
  projectTagRepository: IProjectTagRepository,
  projectRepository: IProjectRepository,
  tagRepository: ITagRepository,
  user: AuthenticatedUser | null
) {
  return new ProjectTagService(projectTagRepository, projectRepository, tagRepository, user);
}
