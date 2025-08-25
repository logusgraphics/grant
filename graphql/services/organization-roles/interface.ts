import {
  QueryOrganizationRolesArgs,
  MutationAddOrganizationRoleArgs,
  MutationRemoveOrganizationRoleArgs,
  OrganizationRole,
} from '@/graphql/generated/types';

export interface IOrganizationRoleService {
  getOrganizationRoles(params: QueryOrganizationRolesArgs): Promise<OrganizationRole[]>;
  addOrganizationRole(params: MutationAddOrganizationRoleArgs): Promise<OrganizationRole>;
  removeOrganizationRole(params: MutationRemoveOrganizationRoleArgs): Promise<OrganizationRole>;
}
