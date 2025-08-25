import { IRoleRepository } from '@/graphql/repositories/roles/interface';
import { AuthenticatedUser } from '@/graphql/types';

import { RoleService } from './service';

export { RoleService } from './service';
export type { IRoleService } from './interface';
export * from './schemas';

export function createRoleService(roleRepository: IRoleRepository, user: AuthenticatedUser | null) {
  return new RoleService(roleRepository, user);
}
