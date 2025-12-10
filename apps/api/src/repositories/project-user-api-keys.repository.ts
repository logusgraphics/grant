import { ProjectUserApiKeyModel, projectUserApiKeys } from '@logusgraphics/grant-database';
import { ProjectUserApiKey } from '@logusgraphics/grant-schema';

import { Transaction } from '@/lib/transaction-manager.lib';

import {
  BasePivotAddArgs,
  BasePivotQueryArgs,
  BasePivotRemoveArgs,
  PivotRepository,
} from './common/PivotRepository';

export class ProjectUserApiKeyRepository extends PivotRepository<
  ProjectUserApiKeyModel,
  ProjectUserApiKey
> {
  protected table = projectUserApiKeys;
  protected parentIdField: keyof ProjectUserApiKeyModel = 'projectId';
  protected relatedIdField: keyof ProjectUserApiKeyModel = 'userId';

  /**
   * Override to include all three pivot fields that form the unique constraint:
   * apiKeyId, projectId, and userId
   */
  protected getUniquePivotFields(): Array<keyof ProjectUserApiKeyModel> {
    return ['apiKeyId', 'projectId', 'userId'];
  }

  protected toEntity(dbPivot: ProjectUserApiKeyModel): ProjectUserApiKey {
    return {
      id: dbPivot.id,
      projectId: dbPivot.projectId,
      userId: dbPivot.userId,
      apiKeyId: dbPivot.apiKeyId,
      createdAt: dbPivot.createdAt,
      updatedAt: dbPivot.updatedAt,
      deletedAt: dbPivot.deletedAt ?? undefined,
    };
  }

  public async getProjectUserApiKeys(
    params: { projectId: string; userId: string },
    transaction?: Transaction
  ): Promise<ProjectUserApiKey[]> {
    const baseParams: BasePivotQueryArgs = {
      parentId: params.projectId,
      relatedId: params.userId,
    };

    return this.query(baseParams, transaction);
  }

  public async addApiKey(
    params: {
      apiKeyId: string;
      projectId: string;
      userId: string;
    },
    transaction?: Transaction
  ): Promise<ProjectUserApiKey> {
    const baseParams: BasePivotAddArgs = {
      parentId: params.projectId,
      relatedId: params.userId,
      apiKeyId: params.apiKeyId,
    };

    return this.add(baseParams, transaction);
  }

  public async removeApiKey(
    params: {
      projectId: string;
      userId: string;
      apiKeyId: string;
    },
    transaction?: Transaction
  ): Promise<ProjectUserApiKey> {
    // Include all unique pivot fields (apiKeyId, projectId, userId) for proper matching
    const baseParams: BasePivotRemoveArgs & { apiKeyId: string } = {
      parentId: params.projectId,
      relatedId: params.userId,
      apiKeyId: params.apiKeyId,
    };

    return this.softDelete(baseParams, transaction);
  }

  public async hardDetachApiKey(
    params: {
      projectId: string;
      userId: string;
      apiKeyId: string;
    },
    transaction?: Transaction
  ): Promise<ProjectUserApiKey> {
    // Include all unique pivot fields (apiKeyId, projectId, userId) for proper matching
    const baseParams: BasePivotRemoveArgs & { apiKeyId: string } = {
      parentId: params.projectId,
      relatedId: params.userId,
      apiKeyId: params.apiKeyId,
    };

    return this.hardDelete(baseParams, transaction);
  }
}
