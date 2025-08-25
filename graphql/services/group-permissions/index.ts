import {
  IGroupPermissionRepository,
  IGroupRepository,
  IPermissionRepository,
} from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { GroupPermissionService } from './service';

export { GroupPermissionService } from './service';
export type { IGroupPermissionService } from './interface';
export * from './schemas';

export function createGroupPermissionService(
  groupPermissionRepository: IGroupPermissionRepository,
  groupRepository: IGroupRepository,
  permissionRepository: IPermissionRepository,
  user: AuthenticatedUser | null
) {
  return new GroupPermissionService(
    groupPermissionRepository,
    groupRepository,
    permissionRepository,
    user
  );
}
