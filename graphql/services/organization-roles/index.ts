import {
  IOrganizationRoleRepository,
  IOrganizationRepository,
  IRoleRepository,
} from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { OrganizationRoleService } from './service';

export * from './interface';
export * from './service';
export * from './schemas';

export function createOrganizationRoleService(
  organizationRoleRepository: IOrganizationRoleRepository,
  organizationRepository: IOrganizationRepository,
  roleRepository: IRoleRepository,
  user: AuthenticatedUser | null
) {
  return new OrganizationRoleService(
    organizationRoleRepository,
    organizationRepository,
    roleRepository,
    user
  );
}
