import { IOrganizationRepository } from '@/graphql/repositories/organizations/interface';
import { AuthenticatedUser } from '@/graphql/types';

import { OrganizationService } from './service';

export * from './schemas';
export * from './interface';
export * from './service';

export function createOrganizationService(
  organizationRepository: IOrganizationRepository,
  user: AuthenticatedUser | null
) {
  return new OrganizationService(organizationRepository, user);
}
