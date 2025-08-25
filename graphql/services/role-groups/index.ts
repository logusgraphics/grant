import { IGroupRepository, IRoleGroupRepository, IRoleRepository } from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { RoleGroupService } from './service';

export * from './interface';
export * from './service';
export * from './schemas';

export function createRoleGroupService(
  roleGroupRepository: IRoleGroupRepository,
  roleRepository: IRoleRepository,
  groupRepository: IGroupRepository,
  user: AuthenticatedUser | null
) {
  return new RoleGroupService(roleGroupRepository, roleRepository, groupRepository, user);
}
