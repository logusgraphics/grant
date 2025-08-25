import {
  IPermissionTagRepository,
  IPermissionRepository,
  ITagRepository,
} from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { PermissionTagService } from './service';

export * from './interface';
export * from './service';
export * from './schemas';

export function createPermissionTagService(
  permissionTagRepository: IPermissionTagRepository,
  permissionRepository: IPermissionRepository,
  tagRepository: ITagRepository,
  user: AuthenticatedUser | null
) {
  return new PermissionTagService(
    permissionTagRepository,
    permissionRepository,
    tagRepository,
    user
  );
}
