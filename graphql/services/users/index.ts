import { IUserRepository } from '@/graphql/repositories/users/interface';
import { AuthenticatedUser } from '@/graphql/types';

import { UserService } from './service';

export * from './schemas';
export * from './interface';
export * from './service';

export function createUserService(userRepository: IUserRepository, user: AuthenticatedUser | null) {
  return new UserService(userRepository, user);
}
