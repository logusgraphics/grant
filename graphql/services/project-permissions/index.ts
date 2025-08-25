import {
  IProjectPermissionRepository,
  IProjectRepository,
  IPermissionRepository,
} from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { ProjectPermissionService } from './service';

export * from './interface';
export * from './service';
export * from './schemas';

export function createProjectPermissionService(
  projectPermissionRepository: IProjectPermissionRepository,
  projectRepository: IProjectRepository,
  permissionRepository: IPermissionRepository,
  user: AuthenticatedUser | null
) {
  return new ProjectPermissionService(
    projectPermissionRepository,
    projectRepository,
    permissionRepository,
    user
  );
}
