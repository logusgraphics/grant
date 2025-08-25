import {
  IOrganizationProjectRepository,
  IOrganizationRepository,
  IProjectRepository,
} from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { OrganizationProjectService } from './service';

export * from './interface';
export * from './service';
export * from './schemas';

export function createOrganizationProjectService(
  organizationProjectRepository: IOrganizationProjectRepository,
  organizationRepository: IOrganizationRepository,
  projectRepository: IProjectRepository,
  user: AuthenticatedUser | null
) {
  return new OrganizationProjectService(
    organizationProjectRepository,
    organizationRepository,
    projectRepository,
    user
  );
}
