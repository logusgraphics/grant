import {
  MutationAddOrganizationUserArgs,
  MutationRemoveOrganizationUserArgs,
  OrganizationUser,
  QueryOrganizationUsersArgs,
} from '@/graphql/generated/types';

export interface IOrganizationUserRepository {
  getOrganizationUsers(
    params: Omit<QueryOrganizationUsersArgs, 'scope'>
  ): Promise<OrganizationUser[]>;
  addOrganizationUser(params: MutationAddOrganizationUserArgs): Promise<OrganizationUser>;
  softDeleteOrganizationUser(params: MutationRemoveOrganizationUserArgs): Promise<OrganizationUser>;
  hardDeleteOrganizationUser(params: MutationRemoveOrganizationUserArgs): Promise<OrganizationUser>;
}
