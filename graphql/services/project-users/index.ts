import {
  IProjectRepository,
  IUserRepository,
  IProjectUserRepository,
} from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { ProjectUserService } from './service';

export * from './interface';
export * from './service';
export * from './schemas';

export function createProjectUserService(
  projectUserRepository: IProjectUserRepository,
  projectRepository: IProjectRepository,
  userRepository: IUserRepository,
  user: AuthenticatedUser | null
) {
  return new ProjectUserService(projectUserRepository, projectRepository, userRepository, user);
}
