import {
  MutationAddOrganizationUserArgs,
  MutationRemoveOrganizationUserArgs,
  OrganizationUser,
  QueryOrganizationUsersArgs,
} from '@/graphql/generated/types';

export interface IOrganizationUserService {
  getOrganizationUsers(
    params: Omit<QueryOrganizationUsersArgs, 'scope'>
  ): Promise<OrganizationUser[]>;
  addOrganizationUser(params: MutationAddOrganizationUserArgs): Promise<OrganizationUser>;
  removeOrganizationUser(params: MutationRemoveOrganizationUserArgs): Promise<OrganizationUser>;
}
