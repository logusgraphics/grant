import {
  QueryProjectRolesArgs,
  MutationAddProjectRoleArgs,
  MutationRemoveProjectRoleArgs,
  ProjectRole,
} from '@/graphql/generated/types';
import { PivotRepository } from '@/graphql/repositories/common';

import { ProjectRoleModel, projectRoles } from './schema';

export class ProjectRoleRepository extends PivotRepository<ProjectRoleModel, ProjectRole> {
  protected table = projectRoles;
  protected parentIdField: keyof ProjectRoleModel = 'projectId';
  protected relatedIdField: keyof ProjectRoleModel = 'roleId';

  protected toEntity(dbPivot: ProjectRoleModel): ProjectRole {
    return {
      id: dbPivot.id,
      projectId: dbPivot.projectId,
      roleId: dbPivot.roleId,
      createdAt: dbPivot.createdAt,
      updatedAt: dbPivot.updatedAt,
      deletedAt: dbPivot.deletedAt,
    };
  }

  public async getProjectRoles(params: QueryProjectRolesArgs): Promise<ProjectRole[]> {
    return this.query({ parentId: params.projectId });
  }

  public async addProjectRole(params: MutationAddProjectRoleArgs): Promise<ProjectRole> {
    return this.add({
      parentId: params.input.projectId,
      relatedId: params.input.roleId,
    });
  }

  public async softDeleteProjectRole(params: MutationRemoveProjectRoleArgs): Promise<ProjectRole> {
    return this.softDelete({
      parentId: params.input.projectId,
      relatedId: params.input.roleId,
    });
  }

  public async hardDeleteProjectRole(params: MutationRemoveProjectRoleArgs): Promise<ProjectRole> {
    return this.hardDelete({
      parentId: params.input.projectId,
      relatedId: params.input.roleId,
    });
  }
}
