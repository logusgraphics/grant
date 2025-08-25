import {
  IOrganizationTagRepository,
  IOrganizationRepository,
  ITagRepository,
} from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { OrganizationTagService } from './service';

export * from './interface';
export * from './service';
export * from './schemas';

export function createOrganizationTagService(
  organizationTagRepository: IOrganizationTagRepository,
  organizationRepository: IOrganizationRepository,
  tagRepository: ITagRepository,
  user: AuthenticatedUser | null
) {
  return new OrganizationTagService(
    organizationTagRepository,
    organizationRepository,
    tagRepository,
    user
  );
}
