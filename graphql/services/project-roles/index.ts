import {
  IProjectRepository,
  IRoleRepository,
  IProjectRoleRepository,
} from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { ProjectRoleService } from './service';

export * from './interface';
export * from './service';
export * from './schemas';

export function createProjectRoleService(
  projectRoleRepository: IProjectRoleRepository,
  projectRepository: IProjectRepository,
  roleRepository: IRoleRepository,
  user: AuthenticatedUser | null
) {
  return new ProjectRoleService(projectRoleRepository, projectRepository, roleRepository, user);
}
