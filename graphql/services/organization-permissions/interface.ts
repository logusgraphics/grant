import {
  MutationAddOrganizationPermissionArgs,
  MutationRemoveOrganizationPermissionArgs,
  OrganizationPermission,
  QueryOrganizationPermissionsArgs,
} from '@/graphql/generated/types';

export interface IOrganizationPermissionService {
  getOrganizationPermissions(
    params: Omit<QueryOrganizationPermissionsArgs, 'scope'>
  ): Promise<OrganizationPermission[]>;
  addOrganizationPermission(
    params: MutationAddOrganizationPermissionArgs
  ): Promise<OrganizationPermission>;
  removeOrganizationPermission(
    params: MutationRemoveOrganizationPermissionArgs
  ): Promise<OrganizationPermission>;
}
