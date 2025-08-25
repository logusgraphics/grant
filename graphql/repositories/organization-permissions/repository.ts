import {
  PivotRepository,
  BasePivotQueryArgs,
  BasePivotAddArgs,
  BasePivotRemoveArgs,
} from '../common/PivotRepository';

import { IOrganizationPermissionRepository } from './interface';
import { OrganizationPermissionModel, organizationPermissions } from './schema';

export class OrganizationPermissionRepository
  extends PivotRepository<OrganizationPermissionModel, OrganizationPermissionModel>
  implements IOrganizationPermissionRepository
{
  protected table = organizationPermissions;
  protected parentIdField: keyof OrganizationPermissionModel = 'organizationId';
  protected relatedIdField: keyof OrganizationPermissionModel = 'permissionId';

  protected toEntity(
    dbOrganizationPermission: OrganizationPermissionModel
  ): OrganizationPermissionModel {
    return dbOrganizationPermission;
  }

  public async getOrganizationPermissions(params: {
    organizationId: string;
  }): Promise<OrganizationPermissionModel[]> {
    const baseParams: BasePivotQueryArgs = {
      parentId: params.organizationId,
    };
    return this.query(baseParams);
  }

  public async addOrganizationPermission(
    organizationId: string,
    permissionId: string
  ): Promise<OrganizationPermissionModel> {
    const baseParams: BasePivotAddArgs = {
      parentId: organizationId,
      relatedId: permissionId,
    };

    const organizationPermission = await this.add(baseParams);
    return organizationPermission;
  }

  public async softDeleteOrganizationPermission(
    organizationId: string,
    permissionId: string
  ): Promise<OrganizationPermissionModel | null> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: organizationId,
      relatedId: permissionId,
    };

    const organizationPermission = await this.softDelete(baseParams);
    return organizationPermission;
  }

  public async hardDeleteOrganizationPermission(
    organizationId: string,
    permissionId: string
  ): Promise<OrganizationPermissionModel | null> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: organizationId,
      relatedId: permissionId,
    };

    const organizationPermission = await this.hardDelete(baseParams);
    return organizationPermission;
  }
}
