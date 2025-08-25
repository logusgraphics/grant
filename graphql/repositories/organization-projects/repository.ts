import { OrganizationProject } from '@/graphql/generated/types';
import {
  PivotRepository,
  BasePivotQueryArgs,
  BasePivotAddArgs,
  BasePivotRemoveArgs,
} from '@/graphql/repositories/common';

import { IOrganizationProjectRepository } from './interface';
import { organizationProjects, OrganizationProjectModel } from './schema';

export class OrganizationProjectRepository
  extends PivotRepository<OrganizationProjectModel, OrganizationProject>
  implements IOrganizationProjectRepository
{
  protected table = organizationProjects;
  protected parentIdField: keyof OrganizationProjectModel = 'organizationId';
  protected relatedIdField: keyof OrganizationProjectModel = 'projectId';

  protected toEntity(dbOrganizationProject: OrganizationProjectModel): OrganizationProject {
    return {
      id: dbOrganizationProject.id,
      organizationId: dbOrganizationProject.organizationId,
      projectId: dbOrganizationProject.projectId,
      createdAt: dbOrganizationProject.createdAt,
      updatedAt: dbOrganizationProject.updatedAt,
      deletedAt: dbOrganizationProject.deletedAt,
    };
  }

  public async getOrganizationProjects(params: {
    organizationId: string;
  }): Promise<OrganizationProject[]> {
    const baseParams: BasePivotQueryArgs = {
      parentId: params.organizationId,
    };

    return this.query(baseParams);
  }

  public async addOrganizationProject(
    organizationId: string,
    projectId: string
  ): Promise<OrganizationProject> {
    const baseParams: BasePivotAddArgs = {
      parentId: organizationId,
      relatedId: projectId,
    };

    const organizationProject = await this.add(baseParams);

    return organizationProject;
  }

  public async softDeleteOrganizationProject(
    organizationId: string,
    projectId: string
  ): Promise<OrganizationProject> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: organizationId,
      relatedId: projectId,
    };

    const organizationProject = await this.softDelete(baseParams);

    return organizationProject;
  }

  public async hardDeleteOrganizationProject(
    organizationId: string,
    projectId: string
  ): Promise<OrganizationProject> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: organizationId,
      relatedId: projectId,
    };

    const organizationProject = await this.hardDelete(baseParams);

    return organizationProject;
  }
}
