import type {
  CdmApplyContext,
  CdmExportContext,
  CdmPermissionRefSpec,
  CdmTeardownContext,
  ICdmEntityHandler,
  IProjectResourceService,
  IResourceService,
} from '@grantjs/core';
import type { ResourceCdmInput } from '@grantjs/schema';

import {
  buildCdmImportMetadata,
  CDM_EXPORT_CATALOG_SNAPSHOT_KEY,
  CDM_IMPORT_METADATA_KEY,
  CDM_SOURCE_METADATA_KEY,
  isCdmCatalogSnapshotMetadata,
  isProjectCdmImportKind,
  mergeCdmImporterMetadata,
  readGrantResourceIdFromCdmExportMetadata,
} from '@/constants/cdm-import.constants';
import { ConflictError, NotFoundError, ValidationError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';
import type { ProjectExportRepository } from '@/repositories/project-export.repository';
import type { ProjectImportRepository } from '@/repositories/project-import.repository';

import { buildExternalKey } from '../identity.lib';
import { mapOwnerIdToExportedTagFields } from '../pivot-tag-export.lib';

const RESOURCE_INPUT_KEY = 'resources' as const;

/**
 * Handler for the CDM `resources` section. Owns CDM-marked resource rows
 * (`resources.metadata.cdmImport.kind === 'resource'`) and their
 * `project_resources` membership for the importing project.
 *
 * Export includes every resource linked to the project (catalog + CDM).
 * Catalog rows carry `metadata.cdmExportCatalogSnapshot` so apply binds to
 * existing entities instead of creating duplicates.
 *
 * Order = 2: runs before {@link PermissionCdmEntity} (4), so permissions can
 * resolve `resourceKey` against `produced.resourceIds` populated here. Runs
 * before tags/roles/users so role-templates may reference custom permissions
 * that themselves reference these resources.
 *
 * Teardown deletes only CDM-marked resources belonging to this project plus
 * their pivot rows (`project_resources`, `resource_tags`). Grant's global
 * system catalog is never touched.
 */
export class ResourceCdmEntity implements ICdmEntityHandler<ResourceCdmInput, ResourceCdmInput> {
  public readonly handlerKind = 'resource';
  public readonly inputKey = RESOURCE_INPUT_KEY;
  public readonly order = 2;

  constructor(
    private readonly importRepo: ProjectImportRepository,
    private readonly exportRepo: ProjectExportRepository,
    private readonly resources: IResourceService,
    private readonly projectResources: IProjectResourceService
  ) {}

  public validateInput(input: readonly ResourceCdmInput[]): void {
    const externalKeys = new Set<string>();
    for (const r of input) {
      const key = r.key?.trim() ?? '';
      if (key === '') {
        throw new ValidationError('resources[]: key is required for each resource');
      }
      if (externalKeys.has(key)) {
        throw new ValidationError(`Duplicate resources key: ${key}`);
      }
      externalKeys.add(key);
      if (typeof r.slug !== 'string' || r.slug.trim() === '') {
        throw new ValidationError(`resources[${key}]: slug is required`);
      }
      if (typeof r.name !== 'string' || r.name.trim() === '') {
        throw new ValidationError(`resources[${key}]: name is required`);
      }
      if (!Array.isArray(r.actions) || r.actions.length === 0) {
        throw new ValidationError(`resources[${key}]: actions must be a non-empty array`);
      }
    }
  }

  public collectPermissionRefs(
    _input: readonly ResourceCdmInput[]
  ): readonly CdmPermissionRefSpec[] {
    return [];
  }

  public async teardown(ctx: CdmTeardownContext): Promise<void> {
    const tx = ctx.tx as Transaction;
    const resourceIds = await this.importRepo.listCdmResourceIdsForProject(ctx.projectId, tx);
    if (resourceIds.length === 0) return;
    await this.importRepo.bulkSoftDeleteCdmResources(resourceIds, ctx.projectId, tx);
  }

  public async apply(ctx: CdmApplyContext, input: readonly ResourceCdmInput[]): Promise<void> {
    const tx = ctx.tx as Transaction;
    for (const row of input) {
      const key = row.key?.trim() ?? '';
      if (isCdmCatalogSnapshotMetadata(row.metadata)) {
        const grantResourceId = readGrantResourceIdFromCdmExportMetadata(row.metadata);
        if (!grantResourceId) {
          throw new ValidationError(
            `resources[${key}]: catalog snapshot rows require metadata.grantResourceId`
          );
        }
        let existing = await this.resources.getResourceById(grantResourceId, tx);
        if (!existing) {
          const revivedFromTombstone =
            await this.importRepo.reviveCdmResourceAndProjectLinkForProject(
              grantResourceId,
              ctx.projectId,
              tx
            );
          if (revivedFromTombstone) {
            existing = await this.resources.getResourceById(grantResourceId, tx);
          }
        }
        if (!existing) {
          throw new NotFoundError('Resource');
        }
        const slugNorm = (row.slug ?? '').trim().toLowerCase();
        if (existing.slug.trim().toLowerCase() !== slugNorm) {
          throw new ValidationError(`resources[${key}]: slug does not match the catalog resource`);
        }
        try {
          await this.projectResources.addProjectResource(
            { projectId: ctx.projectId, resourceId: existing.id },
            tx
          );
          ctx.result.projectResourcesLinked += 1;
        } catch (e) {
          if (!(e instanceof ConflictError)) throw e;
        }
        ctx.produced.resourceIds.set(key, existing.id);
        continue;
      }

      const metadata = mergeCdmImporterMetadata(
        buildCdmImportMetadata(ctx.projectId, 'resource', key),
        row.metadata
      );
      const resource = await this.resources.createResource(
        {
          name: row.name,
          slug:
            row.slug ??
            row.name
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, '.'),
          description: row.description ?? null,
          actions: row.actions,
          isActive: true,
          metadata,
        },
        tx
      );
      await this.projectResources.addProjectResource(
        { projectId: ctx.projectId, resourceId: resource.id },
        tx
      );
      ctx.produced.resourceIds.set(key, resource.id);
      ctx.result.resourcesCreated += 1;
      ctx.result.projectResourcesLinked += 1;
    }
  }

  /**
   * Project current `project_resources` membership back to `ResourceCdmInput[]`.
   *
   * Identity: `externalKey = buildExternalKey('resource', resourceId, slug)` so
   * round-tripped imports never leak Grant UUIDs as identity. The Grant id is
   * preserved under `metadata.grantResourceId` for traceability.
   *
   * Emits every linked resource (catalog + CDM). Catalog-only rows include
   * {@link CDM_EXPORT_CATALOG_SNAPSHOT_KEY} so apply reuses existing rows.
   */
  public async export(ctx: CdmExportContext): Promise<readonly ResourceCdmInput[]> {
    const tx = ctx.tx as Transaction | undefined;
    const [rows, tagRows] = await Promise.all([
      this.exportRepo.getProjectLinkedResourcesForExport(ctx.projectId, tx),
      this.exportRepo.getProjectResourceTagsForExport(ctx.projectId, tx),
    ]);
    const tagByResource = mapOwnerIdToExportedTagFields(
      tagRows.map((t) => ({
        ownerId: t.resourceId,
        tagId: t.tagId,
        tagName: t.tagName,
        tagColor: t.tagColor,
        isPrimary: t.isPrimary,
      }))
    );
    return rows.map((r) => {
      const externalKey = buildExternalKey('resource', r.resourceId, r.slug);
      const cdmSource = extractCdmSourceMetadata(r.metadata);
      const catalogSnapshot = !isProjectCdmImportKind(r.metadata, ctx.projectId, 'resource');
      const metadata: Record<string, unknown> = {
        ...(cdmSource ?? {}),
        grantResourceId: r.resourceId,
        ...(catalogSnapshot ? { [CDM_EXPORT_CATALOG_SNAPSHOT_KEY]: true } : {}),
      };
      const tagFields = tagByResource.get(r.resourceId);
      return {
        key: externalKey,
        slug: r.slug,
        name: r.name,
        description: r.description,
        actions: r.actions,
        metadata,
        ...(tagFields && tagFields.tagKeys.length > 0
          ? { tags: tagFields.tagKeys, primaryTag: tagFields.primaryTagKey }
          : {}),
      };
    });
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
