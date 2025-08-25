import { IRoleRepository, IUserRoleRepository, IUserRepository } from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { UserRoleService } from './service';

export * from './schemas';
export * from './interface';
export * from './service';

export function createUserRoleService(
  userRoleRepository: IUserRoleRepository,
  userRepository: IUserRepository,
  roleRepository: IRoleRepository,
  user: AuthenticatedUser | null
) {
  return new UserRoleService(userRoleRepository, userRepository, roleRepository, user);
}
