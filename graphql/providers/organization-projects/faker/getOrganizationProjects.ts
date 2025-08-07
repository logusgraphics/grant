import { getOrganizationProjectsByOrganizationId } from '@/graphql/providers/organization-projects/faker/dataStore';
import {
  GetOrganizationProjectsParams,
  GetOrganizationProjectsResult,
} from '@/graphql/providers/organization-projects/types';

export async function getOrganizationProjects({
  organizationId,
}: GetOrganizationProjectsParams): Promise<GetOrganizationProjectsResult> {
  const organizationProjectData = getOrganizationProjectsByOrganizationId(organizationId);
  return organizationProjectData;
}
