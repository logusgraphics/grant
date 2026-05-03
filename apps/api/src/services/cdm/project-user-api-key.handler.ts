import type {
  CdmApplyContext,
  CdmExportContext,
  CdmPermissionRefSpec,
  CdmTeardownContext,
  IApiKeyService,
  ICdmEntityHandler,
  IProjectUserApiKeyService,
} from '@grantjs/core';
import { ProjectUserApiKeyCdmInput, SyncProjectPermissionsInput } from '@grantjs/schema';

import {
  buildCdmImportMetadata,
  CDM_IMPORT_METADATA_KEY,
  extractProjectUserMetadataForCdmExport,
  mergeCdmImporterMetadata,
} from '@/constants/cdm-import.constants';
import { ValidationError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';
import type { ProjectPermissionExportRepository } from '@/repositories/project-permission-export.repository';
import type { ProjectPermissionSyncRepository } from '@/repositories/project-permission-sync.repository';

import { clientSecretSchema } from '../api-keys.schemas';

const INPUT_KEY: keyof SyncProjectPermissionsInput = 'projectUserApiKeys';

type CdmImportMetadataBlock = {
  projectId?: string;
  kind?: string;
  externalKey?: string;
};

/**
 * CDM handler for {@link project_user_api_keys}: export identity (no secret);
 * import requires BYOK `clientSecret`. Runs after {@link UserAssignmentHandler}.
 */
export class ProjectUserApiKeyCdmHandler implements ICdmEntityHandler<
  ProjectUserApiKeyCdmInput,
  ProjectUserApiKeyCdmInput
> {
  public readonly handlerKind = 'projectUserApiKey';
  public readonly inputKey = INPUT_KEY;
  public readonly order = 300;

  constructor(
    private readonly syncRepo: ProjectPermissionSyncRepository,
    private readonly exportRepo: ProjectPermissionExportRepository,
    private readonly apiKeys: IApiKeyService,
    private readonly projectUserApiKeys: IProjectUserApiKeyService
  ) {}

  public validateInput(input: readonly ProjectUserApiKeyCdmInput[]): void {
    const externalKeys = new Set<string>();
    for (const row of input) {
      if (row.externalKey != null && row.externalKey !== '') {
        if (externalKeys.has(row.externalKey)) {
          throw new ValidationError(`Duplicate projectUserApiKeys externalKey: ${row.externalKey}`);
        }
        externalKeys.add(row.externalKey);
      }
      const secret = row.clientSecret?.trim() ?? '';
      if (!secret) {
        throw new ValidationError(
          'projectUserApiKeys: clientSecret is required for each key on import (BYOK)'
        );
      }
      const parsed = clientSecretSchema.safeParse(secret);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid clientSecret');
      }
    }
  }

  public collectPermissionRefs(
    _input: readonly ProjectUserApiKeyCdmInput[]
  ): readonly CdmPermissionRefSpec[] {
    return [];
  }

  public async teardown(ctx: CdmTeardownContext): Promise<void> {
    const tx = ctx.tx as Transaction;
    const ids = await this.syncRepo.listCdmProjectUserApiKeyIdsForProject(ctx.projectId, tx);
    for (const id of ids) {
      await this.apiKeys.deleteApiKey({ id, hardDelete: true }, tx);
    }
  }

  public async apply(
    ctx: CdmApplyContext,
    input: readonly ProjectUserApiKeyCdmInput[]
  ): Promise<void> {
    const tx = ctx.tx as Transaction;
    for (const row of input) {
      if (!ctx.assignmentUserIds.has(row.userId)) {
        throw new ValidationError(
          `projectUserApiKeys: userId ${row.userId} is not listed in userAssignments for this import`
        );
      }
      const secret = row.clientSecret?.trim();
      if (!secret) {
        throw new ValidationError(
          `projectUserApiKeys: clientSecret is required for userId ${row.userId}`
        );
      }

      const created = await this.apiKeys.createApiKeyForCdmImport(
        {
          clientSecret: secret,
          clientId: row.clientId ?? undefined,
          name: row.name ?? undefined,
          description: row.description ?? undefined,
          expiresAt: row.expiresAt != null ? new Date(row.expiresAt as string | Date) : undefined,
        },
        tx
      );

      const importBase = buildCdmImportMetadata(
        ctx.projectId,
        'projectUserApiKey',
        row.externalKey ?? undefined
      );
      const pivotMetadata = mergeCdmImporterMetadata(importBase, row.metadata ?? undefined);

      await this.projectUserApiKeys.addProjectUserApiKey(
        {
          projectId: ctx.projectId,
          userId: row.userId,
          apiKeyId: created.id,
          metadata: pivotMetadata,
        },
        tx
      );
      ctx.result.projectUserApiKeysCreated += 1;
    }
  }

  public async export(ctx: CdmExportContext): Promise<readonly ProjectUserApiKeyCdmInput[]> {
    const tx = ctx.tx as Transaction | undefined;
    const rows = await this.exportRepo.getProjectUserApiKeysForCdmExport(ctx.projectId, tx);
    return rows.map((r) => {
      const cdm = r.pivotMetadata[CDM_IMPORT_METADATA_KEY] as CdmImportMetadataBlock | undefined;
      const externalKey =
        cdm?.externalKey != null && cdm.externalKey !== '' ? cdm.externalKey : undefined;
      return {
        userId: r.userId,
        clientId: r.clientId,
        name: r.name ?? undefined,
        description: r.description ?? undefined,
        expiresAt:
          r.expiresAt != null
            ? r.expiresAt instanceof Date
              ? r.expiresAt
              : new Date(String(r.expiresAt))
            : undefined,
        externalKey,
        metadata: extractProjectUserMetadataForCdmExport(r.pivotMetadata) ?? undefined,
      };
    });
  }
}
