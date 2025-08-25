import {
  QueryProjectTagsArgs,
  MutationAddProjectTagArgs,
  MutationRemoveProjectTagArgs,
  ProjectTag,
} from '@/graphql/generated/types';
import { PivotRepository } from '@/graphql/repositories/common';

import { ProjectTagModel, projectTags } from './schema';

export class ProjectTagRepository extends PivotRepository<ProjectTagModel, ProjectTag> {
  protected table = projectTags;
  protected parentIdField: keyof ProjectTagModel = 'projectId';
  protected relatedIdField: keyof ProjectTagModel = 'tagId';

  protected toEntity(dbPivot: ProjectTagModel): ProjectTag {
    return {
      id: dbPivot.id,
      projectId: dbPivot.projectId,
      tagId: dbPivot.tagId,
      createdAt: dbPivot.createdAt,
      updatedAt: dbPivot.updatedAt,
      deletedAt: dbPivot.deletedAt,
    };
  }

  public async getProjectTags(params: QueryProjectTagsArgs): Promise<ProjectTag[]> {
    return this.query({ parentId: params.projectId });
  }

  public async addProjectTag(params: MutationAddProjectTagArgs): Promise<ProjectTag> {
    return this.add({
      parentId: params.input.projectId,
      relatedId: params.input.tagId,
    });
  }

  public async softDeleteProjectTag(params: MutationRemoveProjectTagArgs): Promise<ProjectTag> {
    return this.softDelete({
      parentId: params.input.projectId,
      relatedId: params.input.tagId,
    });
  }

  public async hardDeleteProjectTag(params: MutationRemoveProjectTagArgs): Promise<ProjectTag> {
    return this.hardDelete({
      parentId: params.input.projectId,
      relatedId: params.input.tagId,
    });
  }
}
