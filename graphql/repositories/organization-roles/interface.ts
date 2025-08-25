import {
  QueryOrganizationRolesArgs,
  MutationAddOrganizationRoleArgs,
  MutationRemoveOrganizationRoleArgs,
  OrganizationRole,
} from '@/graphql/generated/types';

export interface IOrganizationRoleRepository {
  getOrganizationRoles(params: QueryOrganizationRolesArgs): Promise<OrganizationRole[]>;
  addOrganizationRole(params: MutationAddOrganizationRoleArgs): Promise<OrganizationRole>;
  softDeleteOrganizationRole(params: MutationRemoveOrganizationRoleArgs): Promise<OrganizationRole>;
  hardDeleteOrganizationRole(params: MutationRemoveOrganizationRoleArgs): Promise<OrganizationRole>;
}
