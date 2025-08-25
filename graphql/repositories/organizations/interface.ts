import {
  QueryOrganizationsArgs,
  MutationCreateOrganizationArgs,
  MutationUpdateOrganizationArgs,
  MutationDeleteOrganizationArgs,
  Organization,
  OrganizationPage,
} from '@/graphql/generated/types';

export interface IOrganizationRepository {
  getOrganizations(
    params: Omit<QueryOrganizationsArgs, 'scope'> & { requestedFields?: string[] }
  ): Promise<OrganizationPage>;
  createOrganization(params: MutationCreateOrganizationArgs): Promise<Organization>;
  updateOrganization(params: MutationUpdateOrganizationArgs): Promise<Organization>;
  softDeleteOrganization(params: MutationDeleteOrganizationArgs): Promise<Organization>;
  hardDeleteOrganization(params: MutationDeleteOrganizationArgs): Promise<Organization>;
}
