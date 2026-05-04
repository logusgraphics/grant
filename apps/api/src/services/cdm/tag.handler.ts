import type {
  CdmApplyContext,
  CdmExportContext,
  CdmPermissionRefSpec,
  CdmTeardownContext,
  ICdmEntityHandler,
  IProjectTagService,
  ITagService,
} from '@grantjs/core';
import { SyncProjectPermissionsInput, TagCdmInput } from '@grantjs/schema';

import {
  buildCdmImportMetadata,
  CDM_IMPORT_METADATA_KEY,
  CDM_SOURCE_METADATA_KEY,
  mergeCdmImporterMetadata,
} from '@/constants/cdm-import.constants';
import { ValidationError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';
import type { ProjectPermissionExportRepository } from '@/repositories/project-permission-export.repository';
import type { ProjectPermissionSyncRepository } from '@/repositories/project-permission-sync.repository';

const TAG_INPUT_KEY: keyof SyncProjectPermissionsInput = 'tags';

/**
 * Handler for the CDM `tags` section. Owns CDM-marked tag rows
 * (`tags.metadata.cdmImport.kind === 'tag'`) and their `project_tags`
 * membership for the importing project.
 *
 * Order = 5: runs before `RoleTemplateHandler` (10) and
 * `UserAssignmentHandler` (20) so those handlers can resolve `tagKeys` /
 * `groupTagKeys` against `produced.tagIds` populated here.
 *
 * Teardown deletes only CDM-marked tags belonging to this project plus
 * their pivot rows (`project_tags`, `role_tags`, `group_tags`, `user_tags`).
 * User-created tags are never touched.
 */
export class TagHandler implements ICdmEntityHandler<TagCdmInput, TagCdmInput> {
  public readonly handlerKind = 'tag';
  public readonly inputKey = TAG_INPUT_KEY;
  public readonly order = 5;

  constructor(
    private readonly syncRepo: ProjectPermissionSyncRepository,
    private readonly exportRepo: ProjectPermissionExportRepository,
    private readonly tags: ITagService,
    private readonly projectTags: IProjectTagService
  ) {}

  public validateInput(input: readonly TagCdmInput[]): void {
    const externalKeys = new Set<string>();
    for (const t of input) {
      if (t.externalKey == null || t.externalKey === '') {
        throw new ValidationError('tags[]: externalKey is required for each tag');
      }
      if (externalKeys.has(t.externalKey)) {
        throw new ValidationError(`Duplicate tags externalKey: ${t.externalKey}`);
      }
      externalKeys.add(t.externalKey);
      if (typeof t.name !== 'string' || t.name.trim() === '') {
        throw new ValidationError(`tags[${t.externalKey}]: name is required`);
      }
      if (typeof t.color !== 'string' || t.color.trim() === '') {
        throw new ValidationError(`tags[${t.externalKey}]: color is required`);
      }
    }
  }

  public collectPermissionRefs(_input: readonly TagCdmInput[]): readonly CdmPermissionRefSpec[] {
    return [];
  }

  public async teardown(ctx: CdmTeardownContext): Promise<void> {
    const tx = ctx.tx as Transaction;
    const tagIds = await this.syncRepo.listCdmTagIdsForProject(ctx.projectId, tx);
    if (tagIds.length === 0) return;
    await this.syncRepo.bulkSoftDeleteCdmTags(tagIds, ctx.projectId, tx);
  }

  public async apply(ctx: CdmApplyContext, input: readonly TagCdmInput[]): Promise<void> {
    const tx = ctx.tx as Transaction;
    for (const row of input) {
      const tagMetadata = mergeCdmImporterMetadata(
        buildCdmImportMetadata(ctx.projectId, 'tag', row.externalKey),
        row.metadata
      );
      const tag = await this.tags.createTag(
        {
          name: row.name,
          color: row.color,
          metadata: tagMetadata,
        },
        tx
      );
      await this.projectTags.addProjectTag(
        {
          projectId: ctx.projectId,
          tagId: tag.id,
          isPrimary: row.isPrimary ?? false,
        },
        tx
      );
      ctx.produced.tagIds.set(row.externalKey, tag.id);
      ctx.result.tagsCreated += 1;
      ctx.result.projectTagsLinked += 1;
    }
  }

  /**
   * Project current `project_tags` membership back to `TagCdmInput[]`.
   *
   * Identity: `externalKey = tag.id` so re-imports preserve cross-references
   * from `tagKeys` / `groupTagKeys` on roles and users.
   *
   * Metadata: only `cdmSource` is forwarded (Grant strips the reserved
   * `cdmImport` envelope on export to make the artifact re-importable via
   * `mergeCdmImporterMetadata`).
   */
  public async export(ctx: CdmExportContext): Promise<readonly TagCdmInput[]> {
    const tx = ctx.tx as Transaction | undefined;
    const rows = await this.exportRepo.getProjectTagDefinitions(ctx.projectId, tx);
    return rows.map((r) => ({
      externalKey: r.tagId,
      name: r.name,
      color: r.color,
      isPrimary: r.isPrimary,
      metadata: extractCdmSourceMetadata(r.metadata),
    }));
  }
}

function extractCdmSourceMetadata(
  metadata: Record<string, unknown>
): Record<string, unknown> | null {
  const source = metadata[CDM_SOURCE_METADATA_KEY];
  if (source == null || typeof source !== 'object' || Array.isArray(source)) {
    return null;
  }
  const out = { ...(source as Record<string, unknown>) };
  delete out[CDM_IMPORT_METADATA_KEY];
  return Object.keys(out).length > 0 ? out : null;
}
