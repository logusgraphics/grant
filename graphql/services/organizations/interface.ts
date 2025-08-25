import {
  QueryOrganizationsArgs,
  MutationCreateOrganizationArgs,
  MutationUpdateOrganizationArgs,
  MutationDeleteOrganizationArgs,
  Organization,
  OrganizationPage,
} from '@/graphql/generated/types';

export interface IOrganizationService {
  getOrganizations(
    params: Omit<QueryOrganizationsArgs, 'scope'> & { requestedFields?: string[] }
  ): Promise<OrganizationPage>;
  createOrganization(params: MutationCreateOrganizationArgs): Promise<Organization>;
  updateOrganization(params: MutationUpdateOrganizationArgs): Promise<Organization>;
  deleteOrganization(
    params: MutationDeleteOrganizationArgs & { hardDelete?: boolean }
  ): Promise<Organization>;
}
