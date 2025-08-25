import {
  IOrganizationPermissionRepository,
  IOrganizationRepository,
  IPermissionRepository,
} from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { OrganizationPermissionService } from './service';

export * from './interface';
export * from './service';
export * from './schemas';

export function createOrganizationPermissionService(
  organizationPermissionRepository: IOrganizationPermissionRepository,
  organizationRepository: IOrganizationRepository,
  permissionRepository: IPermissionRepository,
  user: AuthenticatedUser | null
) {
  return new OrganizationPermissionService(
    organizationPermissionRepository,
    organizationRepository,
    permissionRepository,
    user
  );
}
