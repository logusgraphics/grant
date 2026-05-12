import type {
  CdmApplyContext,
  CdmExportContext,
  CdmPermissionRefSpec,
  CdmTeardownContext,
  IApiKeyService,
  ICdmEntityHandler,
  IProjectUserApiKeyService,
} from '@grantjs/core';

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
import type { CdmProjectUserApiKeyInternal } from './cdm-internal.types';
import { buildExternalKey } from './identity.helper';

const INPUT_KEY = 'projectUserApiKeys' as const;

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
  CdmProjectUserApiKeyInternal,
  CdmProjectUserApiKeyInternal
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

  public validateInput(input: readonly CdmProjectUserApiKeyInternal[]): void {
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
    _input: readonly CdmProjectUserApiKeyInternal[]
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
    input: readonly CdmProjectUserApiKeyInternal[]
  ): Promise<void> {
    const tx = ctx.tx as Transaction;
    for (const row of input) {
      const effectiveUserId = resolveApiKeyUserId(row, ctx);
      if (!ctx.assignmentUserIds.has(effectiveUserId)) {
        throw new ValidationError(
          `projectUserApiKeys: user ${effectiveUserId} is not part of this import's user assignments`
        );
      }
      const secret = row.clientSecret?.trim();
      if (!secret) {
        throw new ValidationError(
          `projectUserApiKeys: clientSecret is required for each key (user ${effectiveUserId})`
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
          userId: effectiveUserId,
          apiKeyId: created.id,
          metadata: pivotMetadata,
        },
        tx
      );
      ctx.result.projectUserApiKeysCreated += 1;
    }
  }

  /**
   * Project current `project_user_api_keys` rows back to `ProjectUserApiKeyCdmInput[]`.
   *
   * Identity: `externalKey = buildExternalKey('apikey', clientId, userId)`. Always
   * emitted (deterministic from the row), so the CDM contract stays uniform with
   * the other handlers — no UUIDs leak as identity, and downstream tools can
   * dedupe by externalKey across exports.
   *
   * The Grant client id is preserved on the row itself (not as identity); the
   * importer-supplied `cdmSource` history is preserved via
   * `extractProjectUserMetadataForCdmExport`. `clientSecret` is never emitted.
   */
  public async export(ctx: CdmExportContext): Promise<readonly CdmProjectUserApiKeyInternal[]> {
    const tx = ctx.tx as Transaction | undefined;
    const [rows, provisionedUsers] = await Promise.all([
      this.exportRepo.getProjectUserApiKeysForCdmExport(ctx.projectId, tx),
      this.exportRepo.getProjectCdmProvisionedUsers(ctx.projectId, tx),
    ]);
    const provisionKeyByUserId = new Map<string, string>();
    for (const p of provisionedUsers) {
      const imp = p.metadata['cdmImport'] as { externalKey?: string } | undefined;
      const ext = imp?.externalKey;
      provisionKeyByUserId.set(
        p.userId,
        ext && ext.length > 0 ? ext : buildExternalKey('user', p.userId, p.name)
      );
    }

    return rows.map((r) => {
      const cdm = r.pivotMetadata[CDM_IMPORT_METADATA_KEY] as CdmImportMetadataBlock | undefined;
      const importerExternalKey =
        cdm?.externalKey != null && cdm.externalKey !== '' ? cdm.externalKey : null;
      const externalKey = importerExternalKey ?? buildExternalKey('apikey', r.clientId, r.userId);
      const userKey = provisionKeyByUserId.get(r.userId);
      const base = {
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
      if (userKey != null) {
        return { ...base, userKey, userId: undefined };
      }
      return { ...base, userId: r.userId, userKey: undefined };
    });
  }
}

function resolveApiKeyUserId(row: CdmProjectUserApiKeyInternal, ctx: CdmApplyContext): string {
  if (row.userId != null && row.userId !== '') {
    return row.userId;
  }
  if (row.userKey != null && row.userKey !== '') {
    const id = ctx.produced.userIds.get(row.userKey);
    if (!id) {
      throw new ValidationError(`projectUserApiKeys: unresolved userKey '${row.userKey}'`);
    }
    return id;
  }
  throw new ValidationError('projectUserApiKeys: each entry requires userId or userKey');
}
