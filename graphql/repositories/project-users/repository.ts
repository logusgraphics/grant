import {
  MutationAddProjectUserArgs,
  MutationRemoveProjectUserArgs,
  ProjectUser,
} from '@/graphql/generated/types';
import {
  PivotRepository,
  BasePivotQueryArgs,
  BasePivotAddArgs,
  BasePivotRemoveArgs,
} from '@/graphql/repositories/common';

import { IProjectUserRepository } from './interface';
import { projectUsers, ProjectUserModel } from './schema';

export class ProjectUserRepository
  extends PivotRepository<ProjectUserModel, ProjectUser>
  implements IProjectUserRepository
{
  protected table = projectUsers;
  protected parentIdField: keyof ProjectUserModel = 'projectId';
  protected relatedIdField: keyof ProjectUserModel = 'userId';

  protected toEntity(dbProjectUser: ProjectUserModel): ProjectUser {
    return {
      id: dbProjectUser.id,
      projectId: dbProjectUser.projectId,
      userId: dbProjectUser.userId,
      createdAt: dbProjectUser.createdAt,
      updatedAt: dbProjectUser.updatedAt,
      deletedAt: dbProjectUser.deletedAt,
    };
  }

  public async getProjectUsers(params: { projectId: string }): Promise<ProjectUser[]> {
    const baseParams: BasePivotQueryArgs = {
      parentId: params.projectId,
    };

    return this.query(baseParams);
  }

  public async addProjectUser(params: MutationAddProjectUserArgs): Promise<ProjectUser> {
    const baseParams: BasePivotAddArgs = {
      parentId: params.input.projectId,
      relatedId: params.input.userId,
    };

    const projectUser = await this.add(baseParams);

    return projectUser;
  }

  public async softDeleteProjectUser(params: MutationRemoveProjectUserArgs): Promise<ProjectUser> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: params.input.projectId,
      relatedId: params.input.userId,
    };

    const projectUser = await this.softDelete(baseParams);

    return projectUser;
  }

  public async hardDeleteProjectUser(params: MutationRemoveProjectUserArgs): Promise<ProjectUser> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: params.input.projectId,
      relatedId: params.input.userId,
    };

    const projectUser = await this.hardDelete(baseParams);

    return projectUser;
  }
}
