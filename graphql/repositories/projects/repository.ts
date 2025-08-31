import {
  QueryProjectsArgs,
  MutationUpdateProjectArgs,
  MutationDeleteProjectArgs,
  Project,
  ProjectPage,
  CreateProjectInput,
} from '@/graphql/generated/types';
import { Transaction } from '@/graphql/lib/transactions/TransactionManager';
import {
  EntityRepository,
  BaseCreateArgs,
  BaseUpdateArgs,
  BaseDeleteArgs,
} from '@/graphql/repositories/common';
import { SelectedFields } from '@/graphql/services/common';

import { ProjectModel, projects } from './schema';

export class ProjectRepository extends EntityRepository<ProjectModel, Project> {
  protected table = projects;
  protected searchFields: Array<keyof ProjectModel> = ['name', 'slug', 'description'];
  protected defaultSortField: keyof ProjectModel = 'createdAt';

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  public async getProjects(
    params: Omit<QueryProjectsArgs, 'organizationId'> & SelectedFields<ProjectModel>,
    transaction?: Transaction
  ): Promise<ProjectPage> {
    const result = await this.query(params, transaction);

    return {
      projects: result.items,
      totalCount: result.totalCount,
      hasNextPage: result.hasNextPage,
    };
  }

  public async getProjectById(id: string): Promise<Project | null> {
    try {
      const result = await this.query({
        ids: [id],
        limit: 1,
      });

      return result.items.length > 0 ? result.items[0] : null;
    } catch (error) {
      console.error('Get project by ID error:', error);
      return null;
    }
  }

  public async createProject(
    params: Omit<CreateProjectInput, 'organizationId' | 'tagIds'>,
    transaction?: Transaction
  ): Promise<Project> {
    const baseParams: BaseCreateArgs = {
      name: params.name,
      slug: this.generateSlug(params.name),
      description: params.description,
    };

    return this.create(baseParams, transaction);
  }

  public async updateProject(
    params: MutationUpdateProjectArgs,
    transaction?: Transaction
  ): Promise<Project> {
    const baseParams: BaseUpdateArgs = {
      id: params.id,
      input: {
        name: params.input.name,
        slug: params.input.name ? this.generateSlug(params.input.name) : undefined,
        description: params.input.description,
      },
    };

    return this.update(baseParams, transaction);
  }

  public async softDeleteProject(
    params: MutationDeleteProjectArgs,
    transaction?: Transaction
  ): Promise<Project> {
    const baseParams: BaseDeleteArgs = {
      id: params.id,
    };

    return this.softDelete(baseParams, transaction);
  }

  public async hardDeleteProject(
    params: MutationDeleteProjectArgs,
    transaction?: Transaction
  ): Promise<Project> {
    const baseParams: BaseDeleteArgs = {
      id: params.id,
    };

    return this.hardDelete(baseParams, transaction);
  }
}
