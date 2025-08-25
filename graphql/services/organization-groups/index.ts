import {
  IOrganizationGroupRepository,
  IOrganizationRepository,
  IGroupRepository,
} from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { OrganizationGroupService } from './service';

export * from './interface';
export * from './service';
export * from './schemas';

export function createOrganizationGroupService(
  organizationGroupRepository: IOrganizationGroupRepository,
  organizationRepository: IOrganizationRepository,
  groupRepository: IGroupRepository,
  user: AuthenticatedUser | null
) {
  return new OrganizationGroupService(
    organizationGroupRepository,
    organizationRepository,
    groupRepository,
    user
  );
}
