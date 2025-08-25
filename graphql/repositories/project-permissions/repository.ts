import {
  QueryProjectPermissionsArgs,
  MutationAddProjectPermissionArgs,
  MutationRemoveProjectPermissionArgs,
  ProjectPermission,
} from '@/graphql/generated/types';
import { PivotRepository } from '@/graphql/repositories/common';

import { ProjectPermissionModel, projectPermissions } from './schema';

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
    params: QueryProjectPermissionsArgs
  ): Promise<ProjectPermission[]> {
    return this.query({ parentId: params.projectId });
  }

  public async addProjectPermission(
    params: MutationAddProjectPermissionArgs
  ): Promise<ProjectPermission> {
    return this.add({
      parentId: params.input.projectId,
      relatedId: params.input.permissionId,
    });
  }

  public async softDeleteProjectPermission(
    params: MutationRemoveProjectPermissionArgs
  ): Promise<ProjectPermission> {
    return this.softDelete({
      parentId: params.input.projectId,
      relatedId: params.input.permissionId,
    });
  }

  public async hardDeleteProjectPermission(
    params: MutationRemoveProjectPermissionArgs
  ): Promise<ProjectPermission> {
    return this.hardDelete({
      parentId: params.input.projectId,
      relatedId: params.input.permissionId,
    });
  }
}
