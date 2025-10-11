import { ProjectPermissionModel, projectPermissions } from '@logusgraphics/grant-database';
import {
  ProjectPermission,
  RemoveProjectPermissionInput,
  AddProjectPermissionInput,
} from '@logusgraphics/grant-schema';

import { Transaction } from '@/lib/transaction-manager.lib';
import { PivotRepository } from '@/repositories/common';

export class ProjectPermissionRepository extends PivotRepository<
  ProjectPermissionModel,
  ProjectPermission
> {
  protected table = projectPermissions;
  protected parentIdField: keyof ProjectPermissionModel = 'projectId';
  protected relatedIdField: keyof ProjectPermissionModel = 'permissionId';

  protected toEntity(dbPivot: ProjectPermissionModel): ProjectPermission {
    return {
      id: dbPivot.id,
      projectId: dbPivot.projectId,
      permissionId: dbPivot.permissionId,
      createdAt: dbPivot.createdAt,
      updatedAt: dbPivot.updatedAt,
      deletedAt: dbPivot.deletedAt,
    };
  }

  public async getProjectPermissions(
    params: { projectId: string },
    transaction?: Transaction
  ): Promise<ProjectPermission[]> {
    return this.query({ parentId: params.projectId }, transaction);
  }

  public async addProjectPermission(
    params: AddProjectPermissionInput,
    transaction?: Transaction
  ): Promise<ProjectPermission> {
    return this.add(
      {
        parentId: params.projectId,
        relatedId: params.permissionId,
      },
      transaction
    );
  }

  public async softDeleteProjectPermission(
    params: RemoveProjectPermissionInput,
    transaction?: Transaction
  ): Promise<ProjectPermission> {
    return this.softDelete(
      {
        parentId: params.projectId,
        relatedId: params.permissionId,
      },
      transaction
    );
  }

  public async hardDeleteProjectPermission(
    params: RemoveProjectPermissionInput,
    transaction?: Transaction
  ): Promise<ProjectPermission> {
    return this.hardDelete(
      {
        parentId: params.projectId,
        relatedId: params.permissionId,
      },
      transaction
    );
  }
}
