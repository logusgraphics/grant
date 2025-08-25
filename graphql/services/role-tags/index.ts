import { IRoleRepository, IRoleTagRepository, ITagRepository } from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { RoleTagService } from './service';

export * from './interface';
export * from './service';
export * from './schemas';

export function createRoleTagService(
  roleTagRepository: IRoleTagRepository,
  roleRepository: IRoleRepository,
  tagRepository: ITagRepository,
  user: AuthenticatedUser | null
) {
  return new RoleTagService(roleTagRepository, roleRepository, tagRepository, user);
}
