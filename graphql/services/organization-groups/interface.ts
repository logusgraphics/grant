import {
  MutationAddOrganizationGroupArgs,
  MutationRemoveOrganizationGroupArgs,
  OrganizationGroup,
  QueryOrganizationGroupsArgs,
} from '@/graphql/generated/types';

export interface IOrganizationGroupService {
  getOrganizationGroups(
    params: Omit<QueryOrganizationGroupsArgs, 'scope'>
  ): Promise<OrganizationGroup[]>;
  addOrganizationGroup(params: MutationAddOrganizationGroupArgs): Promise<OrganizationGroup>;
  removeOrganizationGroup(params: MutationRemoveOrganizationGroupArgs): Promise<OrganizationGroup>;
}
