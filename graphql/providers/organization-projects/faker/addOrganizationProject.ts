import { OrganizationProject } from '@/graphql/generated/types';
import { addOrganizationProject as addOrganizationProjectInStore } from '@/graphql/providers/organization-projects/faker/dataStore';

import { AddOrganizationProjectParams, AddOrganizationProjectResult } from '../types';

export async function addOrganizationProject({
  input,
}: AddOrganizationProjectParams): Promise<AddOrganizationProjectResult> {
  const organizationProjectData = addOrganizationProjectInStore(
    input.organizationId,
    input.projectId
  );
  return organizationProjectData as OrganizationProject; // Convert OrganizationProjectData to OrganizationProject for GraphQL
}
