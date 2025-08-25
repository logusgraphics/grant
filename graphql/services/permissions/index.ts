import { IPermissionRepository } from '@/graphql/repositories/permissions/interface';
import { AuthenticatedUser } from '@/graphql/types';

import { PermissionService } from './service';

export { PermissionService } from './service';
export type { IPermissionService } from './interface';
export * from './schemas';

export function createPermissionService(
  permissionRepository: IPermissionRepository,
  user: AuthenticatedUser | null
) {
  return new PermissionService(permissionRepository, user);
}
