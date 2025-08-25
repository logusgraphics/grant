import {
  IOrganizationUserRepository,
  IOrganizationRepository,
  IUserRepository,
} from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { OrganizationUserService } from './service';

export * from './interface';
export * from './service';
export * from './schemas';

export function createOrganizationUserService(
  organizationUserRepository: IOrganizationUserRepository,
  organizationRepository: IOrganizationRepository,
  userRepository: IUserRepository,
  user: AuthenticatedUser | null
) {
  return new OrganizationUserService(
    organizationUserRepository,
    organizationRepository,
    userRepository,
    user
  );
}
