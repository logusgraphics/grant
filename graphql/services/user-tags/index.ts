import { ITagRepository, IUserTagRepository, IUserRepository } from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { UserTagService } from './service';

export * from './schemas';
export * from './interface';
export * from './service';

export function createUserTagService(
  userTagRepository: IUserTagRepository,
  userRepository: IUserRepository,
  tagRepository: ITagRepository,
  user: AuthenticatedUser | null
) {
  return new UserTagService(userTagRepository, userRepository, tagRepository, user);
}
