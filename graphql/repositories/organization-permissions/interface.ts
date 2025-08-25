import { OrganizationPermissionModel } from './schema';

export interface IOrganizationPermissionRepository {
  getOrganizationPermissions(params: {
    organizationId?: string;
    permissionId?: string;
  }): Promise<OrganizationPermissionModel[]>;
  addOrganizationPermission(
    organizationId: string,
    permissionId: string
  ): Promise<OrganizationPermissionModel>;
  softDeleteOrganizationPermission(
    organizationId: string,
    permissionId: string
  ): Promise<OrganizationPermissionModel | null>;
  hardDeleteOrganizationPermission(
    organizationId: string,
    permissionId: string
  ): Promise<OrganizationPermissionModel | null>;
}
