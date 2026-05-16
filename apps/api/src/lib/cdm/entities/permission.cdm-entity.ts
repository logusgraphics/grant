import type {
  CdmApplyContext,
  CdmExportContext,
  CdmPermissionRefSpec,
  CdmTeardownContext,
  ICdmEntityHandler,
  IPermissionService,
  IProjectPermissionService,
  IResourceService,
} from '@grantjs/core';
import { PermissionCdmInput } from '@grantjs/schema';

import {
  buildCdmImportMetadata,
  CDM_EXPORT_CATALOG_SNAPSHOT_KEY,
  CDM_IMPORT_METADATA_KEY,
  CDM_SOURCE_METADATA_KEY,
  isCdmCatalogSnapshotMetadata,
  isProjectCdmImportKind,
  mergeCdmImporterMetadata,
  readGrantPermissionIdFromCdmExportMetadata,
} from '@/constants/cdm-import.constants';
import { ConflictError, NotFoundError, ValidationError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';
import type { ProjectExportRepository } from '@/repositories/project-export.repository';
import type { ProjectImportRepository } from '@/repositories/project-import.repository';

import { buildExternalKey } from '../identity.lib';
import { resolveSinglePermissionRef } from '../permission-ref.lib';
import { mapOwnerIdToExportedTagFields } from '../pivot-tag-export.lib';

const PERMISSION_INPUT_KEY = 'permissions' as const;

export class PermissionCdmEntity implements ICdmEntityHandler<
  PermissionCdmInput,
  PermissionCdmInput
> {
  public readonly handlerKind = 'permission';
  public readonly inputKey = PERMISSION_INPUT_KEY;
  public readonly order = 4;

  constructor(
    private readonly importRepo: ProjectImportRepository,
    private readonly exportRepo: ProjectExportRepository,
    private readonly permissions: IPermissionService,
    private readonly projectPermissions: IProjectPermissionService,
    private readonly resources: IResourceService
  ) {}

  public validateInput(input: readonly PermissionCdmInput[]): void {
    const externalKeys = new Set<string>();
    for (const p of input) {
      const key = p.key?.trim() ?? '';
      if (key === '') {
        throw new ValidationError('permissions[]: key is required for each permission');
      }
      if (externalKeys.has(key)) {
        throw new ValidationError(`Duplicate permissions key: ${key}`);
      }
      externalKeys.add(key);
      const resourceKey = p.resource?.trim() ?? '';
      if (resourceKey === '') {
        throw new ValidationError(`permissions[${key}]: resource is required`);
      }
      if (typeof p.action !== 'string' || p.action.trim() === '') {
        throw new ValidationError(`permissions[${key}]: action is required`);
      }
      if (typeof p.name !== 'string' || p.name.trim() === '') {
        throw new ValidationError(`permissions[${key}]: name is required`);
      }
    }
  }

  public collectPermissionRefs(
    _input: readonly PermissionCdmInput[]
  ): readonly CdmPermissionRefSpec[] {
    return [];
  }

  public async teardown(ctx: CdmTeardownContext): Promise<void> {
    const tx = ctx.tx as Transaction;
    const permissionIds = await this.importRepo.listCdmPermissionIdsForProject(ctx.projectId, tx);
    if (permissionIds.length === 0) return;
    await this.importRepo.bulkSoftDeleteCdmPermissions(permissionIds, ctx.projectId, tx);
  }

  public async apply(ctx: CdmApplyContext, input: readonly PermissionCdmInput[]): Promise<void> {
    const tx = ctx.tx as Transaction;
    for (const row of input) {
      const key = row.key?.trim() ?? '';
      const resourceKey = row.resource?.trim() ?? '';
      const resourceId = ctx.produced.resourceIds.get(resourceKey);
      if (!resourceId) {
        throw new ValidationError(
          `permissions[${key}]: resourceKey "${resourceKey}" must reference a resource declared in the same CDM document`
        );
      }

      if (isCdmCatalogSnapshotMetadata(row.metadata)) {
        const grantPermissionId = readGrantPermissionIdFromCdmExportMetadata(row.metadata);
        if (!grantPermissionId) {
          throw new ValidationError(
            `permissions[${key}]: catalog snapshot rows require metadata.grantPermissionId`
          );
        }
        const resource = await this.resources.getResourceById(resourceId, tx);
        if (!resource) {
          throw new NotFoundError('Resource');
        }
        const resolved = await resolveSinglePermissionRef(
          this.importRepo,
          {
            resourceSlug: resource.slug,
            action: row.action,
            permissionId: grantPermissionId,
            condition: (row.condition as Record<string, unknown> | null) ?? null,
          },
          tx
        );
        if (resolved == null) {
          throw new ValidationError(
            `permissions[${key}]: catalog snapshot rows require resourceSlug + action + permissionId`
          );
        }
        try {
          await this.projectPermissions.addProjectPermission(
            { projectId: ctx.projectId, permissionId: resolved.id },
            tx
          );
          ctx.result.projectPermissionsLinked += 1;
        } catch (e) {
          if (!(e instanceof ConflictError)) throw e;
        }
        ctx.produced.permissionIds.set(key, resolved.id);
        continue;
      }

      const metadata = mergeCdmImporterMetadata(
        buildCdmImportMetadata(ctx.projectId, 'permission', key),
        row.metadata
      );
      const permission = await this.permissions.createPermission(
        {
          name: row.name,
          description: row.description ?? null,
          action: row.action,
          resourceId,
          condition: (row.condition as Record<string, unknown> | null) ?? null,
          metadata,
        },
        tx
      );
      await this.projectPermissions.addProjectPermission(
        { projectId: ctx.projectId, permissionId: permission.id },
        tx
      );
      ctx.produced.permissionIds.set(key, permission.id);
      ctx.result.permissionsCreated += 1;
      ctx.result.projectPermissionsLinked += 1;
    }
  }

  /**
   * Project current `project_permissions` membership back to
   * `PermissionCdmInput[]`.
   *
   * Identity: `externalKey = buildExternalKey('permission', permissionId, slug, action)`.
   * `resourceKey` is the matching resource's exported key (recomputed here so a
   * single re-export call is enough — handlers don't share state via this path).
   * The Grant id is preserved under `metadata.grantPermissionId`.
   */
  public async export(ctx: CdmExportContext): Promise<readonly PermissionCdmInput[]> {
    const tx = ctx.tx as Transaction | undefined;
    const [permissionRows, resourceRows, permissionTagRows] = await Promise.all([
      this.exportRepo.getProjectLinkedPermissionsForExport(ctx.projectId, tx),
      this.exportRepo.getProjectLinkedResourcesForExport(ctx.projectId, tx),
      this.exportRepo.getProjectPermissionTagsForExport(ctx.projectId, tx),
    ]);

    const resourceKeyById = new Map<string, string>();
    for (const r of resourceRows) {
      resourceKeyById.set(r.resourceId, buildExternalKey('resource', r.resourceId, r.slug));
    }

    const tagByPermission = mapOwnerIdToExportedTagFields(
      permissionTagRows.map((t) => ({
        ownerId: t.permissionId,
        tagId: t.tagId,
        tagName: t.tagName,
        tagColor: t.tagColor,
        isPrimary: t.isPrimary,
      }))
    );

    return permissionRows.flatMap((p) => {
      if (p.resourceId == null) {
        return [];
      }
      const resourceKey = resourceKeyById.get(p.resourceId);
      if (!resourceKey) {
        return [];
      }
      const externalKey = buildExternalKey(
        'permission',
        p.permissionId,
        p.resourceSlug ?? '',
        p.action
      );
      const cdmSource = extractCdmSourceMetadata(p.metadata);
      const catalogSnapshot = !isProjectCdmImportKind(p.metadata, ctx.projectId, 'permission');
      const metadata: Record<string, unknown> = {
        ...(cdmSource ?? {}),
        grantPermissionId: p.permissionId,
        ...(catalogSnapshot ? { [CDM_EXPORT_CATALOG_SNAPSHOT_KEY]: true } : {}),
      };
      const tagFields = tagByPermission.get(p.permissionId);
      return [
        {
          key: externalKey,
          resource: resourceKey,
          action: p.action,
          name: p.name,
          description: p.description,
          condition: p.condition,
          metadata,
          ...(tagFields && tagFields.tagKeys.length > 0
            ? { tags: tagFields.tagKeys, primaryTag: tagFields.primaryTagKey }
            : {}),
        },
      ];
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
