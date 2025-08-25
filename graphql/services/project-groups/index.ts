import {
  IProjectGroupRepository,
  IProjectRepository,
  IGroupRepository,
} from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { ProjectGroupService } from './service';

export * from './interface';
export * from './service';
export * from './schemas';

export function createProjectGroupService(
  projectGroupRepository: IProjectGroupRepository,
  projectRepository: IProjectRepository,
  groupRepository: IGroupRepository,
  user: AuthenticatedUser | null
) {
  return new ProjectGroupService(projectGroupRepository, projectRepository, groupRepository, user);
}
