import {
  QueryProjectGroupsArgs,
  MutationAddProjectGroupArgs,
  MutationRemoveProjectGroupArgs,
  ProjectGroup,
} from '@/graphql/generated/types';
import { PivotRepository } from '@/graphql/repositories/common';

import { ProjectGroupModel, projectGroups } from './schema';

export class ProjectGroupRepository extends PivotRepository<ProjectGroupModel, ProjectGroup> {
  protected table = projectGroups;
  protected parentIdField: keyof ProjectGroupModel = 'projectId';
  protected relatedIdField: keyof ProjectGroupModel = 'groupId';

  protected toEntity(dbPivot: ProjectGroupModel): ProjectGroup {
    return {
      id: dbPivot.id,
      projectId: dbPivot.projectId,
      groupId: dbPivot.groupId,
      createdAt: dbPivot.createdAt,
      updatedAt: dbPivot.updatedAt,
      deletedAt: dbPivot.deletedAt,
    };
  }

  public async getProjectGroups(params: QueryProjectGroupsArgs): Promise<ProjectGroup[]> {
    return this.query({ parentId: params.projectId });
  }

  public async addProjectGroup(params: MutationAddProjectGroupArgs): Promise<ProjectGroup> {
    return this.add({
      parentId: params.input.projectId,
      relatedId: params.input.groupId,
    });
  }

  public async softDeleteProjectGroup(
    params: MutationRemoveProjectGroupArgs
  ): Promise<ProjectGroup> {
    return this.softDelete({
      parentId: params.input.projectId,
      relatedId: params.input.groupId,
    });
  }

  public async hardDeleteProjectGroup(
    params: MutationRemoveProjectGroupArgs
  ): Promise<ProjectGroup> {
    return this.hardDelete({
      parentId: params.input.projectId,
      relatedId: params.input.groupId,
    });
  }
}
