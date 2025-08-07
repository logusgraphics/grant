import { ApolloServerErrorCode } from '@apollo/server/errors';

import { ApiError } from '@/graphql/errors';
import { OrganizationProject } from '@/graphql/generated/types';
import { deleteOrganizationProjectByOrganizationAndProject } from '@/graphql/providers/organization-projects/faker/dataStore';
import {
  RemoveOrganizationProjectParams,
  RemoveOrganizationProjectResult,
} from '@/graphql/providers/organization-projects/types';

export async function removeOrganizationProject({
  input,
}: RemoveOrganizationProjectParams): Promise<RemoveOrganizationProjectResult> {
  const deletedOrganizationProject = deleteOrganizationProjectByOrganizationAndProject(
    input.organizationId,
    input.projectId
  );

  if (!deletedOrganizationProject) {
    throw new ApiError(
      'OrganizationProject not found',
      ApolloServerErrorCode.PERSISTED_QUERY_NOT_FOUND
    );
  }

  return deletedOrganizationProject as OrganizationProject; // Convert OrganizationProjectData to OrganizationProject for GraphQL
}
