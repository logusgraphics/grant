import type {
  CdmApplyContext,
  CdmExportContext,
  CdmPermissionRefSpec,
  CdmTeardownContext,
  ICdmEntityHandler,
} from '@grantjs/core';
import { RoleTemplateCdmInput, SyncProjectPermissionsInput } from '@grantjs/schema';

import { CDM_IMPORT_METADATA_KEY, CDM_SOURCE_METADATA_KEY } from '@/constants/cdm-import.constants';
import { ValidationError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';
import type { ProjectPermissionExportRepository } from '@/repositories/project-permission-export.repository';
import type {
  ProjectPermissionSyncRepository,
  ResolvedCdmPermission,
} from '@/repositories/project-permission-sync.repository';

import type { CdmEntityBuilder } from './cdm-entity-builder';

const ROLE_TEMPLATE_INPUT_KEY: keyof SyncProjectPermissionsInput = 'roleTemplates';

/**
 * Handler for `roleTemplates`. Owns CDM-marked role/group entities (metadata
 * `cdmImport.kind === 'role'` and `'group'`).
 *
 * Behavioural parity invariant: this handler must produce the exact same
 * counts and metadata writes that the monolithic `ProjectPermissionSyncService`
 * used to produce, because the integration suite asserts the result counters
 * field-by-field.
 */
export class RoleTemplateHandler implements ICdmEntityHandler<
  RoleTemplateCdmInput,
  RoleTemplateCdmInput
> {
  public readonly handlerKind = 'roleTemplate';
  public readonly inputKey = ROLE_TEMPLATE_INPUT_KEY;
  public readonly order = 10;

  constructor(
    private readonly syncRepo: ProjectPermissionSyncRepository,
    private readonly exportRepo: ProjectPermissionExportRepository,
    private readonly builder: CdmEntityBuilder
  ) {}

  public validateInput(input: readonly RoleTemplateCdmInput[]): void {
    const externalKeys = new Set<string>();
    for (const t of input) {
      if (externalKeys.has(t.externalKey)) {
        throw new ValidationError(`Duplicate role template externalKey: ${t.externalKey}`);
      }
      externalKeys.add(t.externalKey);
      if (t.permissionRefs.length === 0) {
        throw new ValidationError(
          `roleTemplates[${t.externalKey}] must include at least one permissionRef`
        );
      }
    }
  }

  public collectPermissionRefs(
    input: readonly RoleTemplateCdmInput[]
  ): readonly CdmPermissionRefSpec[] {
    const refs: CdmPermissionRefSpec[] = [];
    for (const t of input) {
      for (const r of t.permissionRefs) {
        refs.push({
          resourceSlug: r.resourceSlug,
          action: r.action,
          permissionId: r.permissionId ?? null,
          condition: (r.condition as Record<string, unknown> | null | undefined) ?? null,
        });
      }
    }
    return refs;
  }

  /**
   * Tear down all CDM-marked roles and groups for the project. Note: the
   * sweep also removes groups belonging to direct-user-role bundles owned by
   * the user-assignment handler, because direct-role groups share the
   * `metadata.cdmImport.kind = 'group'` marker. This is the legacy contract
   * the monolithic `teardownCdmEntities` followed; the user-assignment
   * handler's teardown is therefore a no-op (see its source for rationale).
   */
  public async teardown(ctx: CdmTeardownContext): Promise<void> {
    const tx = ctx.tx as Transaction;
    const roleIds = await this.syncRepo.listCdmRoleIdsForProject(ctx.projectId, tx);
    const groupIds = await this.syncRepo.listCdmGroupIdsForProject(ctx.projectId, tx);
    for (const roleId of roleIds) {
      await this.builder.deleteCdmRole(roleId, ctx.projectId, ctx.scope, tx);
    }
    for (const groupId of groupIds) {
      await this.builder.deleteCdmGroup(groupId, ctx.projectId, ctx.scope, tx);
    }
  }

  public async apply(ctx: CdmApplyContext, input: readonly RoleTemplateCdmInput[]): Promise<void> {
    const tx = ctx.tx as Transaction;
    for (const tmpl of input) {
      const perms = tmpl.permissionRefs.map((r) =>
        this.lookupRef(ctx, {
          resourceSlug: r.resourceSlug,
          action: r.action,
          permissionId: r.permissionId ?? null,
          condition: (r.condition as Record<string, unknown> | null | undefined) ?? null,
        })
      );
      const { roleId, counts } = await this.builder.createRoleWithGroup(
        ctx.projectId,
        ctx.scope,
        tmpl.externalKey,
        tmpl.name,
        tmpl.description ?? null,
        'role',
        perms,
        tmpl.metadata,
        tx
      );
      ctx.produced.roleTemplateIds.set(tmpl.externalKey, roleId);
      ctx.result.rolesCreated += 1;
      ctx.result.groupsCreated += 1;
      ctx.result.roleGroupsLinked += counts.roleGroups;
      ctx.result.groupPermissionsLinked += counts.groupPermissions;
      ctx.result.projectRolesLinked += counts.projectRoles;
      ctx.result.projectGroupsLinked += counts.projectGroups;
      ctx.result.projectPermissionsLinked += counts.projectPermissions;
      ctx.result.projectResourcesLinked += counts.projectResources;
    }
  }

  /**
   * Project current roles + their effective permissions back to the CDM
   * `RoleTemplateCdmInput` shape.
   *
   * Identity preservation: `externalKey = role.id`. Re-importing a snapshot
   * uses the same external keys, so user assignments referencing those keys
   * still resolve.
   *
   * Permission refs include `permissionId` so re-import is unambiguous (no
   * fallback to slug/action/condition ambiguity resolution required).
   *
   * Metadata: only `cdmSource` is forwarded to the export. The reserved
   * `cdmImport` envelope is stripped because re-import reconstructs it from
   * scratch via `mergeCdmImporterMetadata` and would otherwise reject the
   * payload.
   */
  public async export(ctx: CdmExportContext): Promise<readonly RoleTemplateCdmInput[]> {
    const tx = ctx.tx as Transaction | undefined;
    const rows = await this.exportRepo.getProjectRolesWithPermissions(ctx.projectId, tx);
    return rows.map((r) => ({
      externalKey: r.roleId,
      name: stripCdmRolePrefix(r.name),
      description: r.description,
      permissionRefs: r.permissions.map((p) => ({
        resourceSlug: p.resourceSlug,
        action: p.action,
        permissionId: p.permissionId,
        condition: p.condition,
      })),
      metadata: extractCdmSourceMetadata(r.metadata),
    }));
  }

  private lookupRef(ctx: CdmApplyContext, ref: CdmPermissionRefSpec): ResolvedCdmPermission {
    return ctx.lookupResolvedRef(ref) as ResolvedCdmPermission;
  }
}

/**
 * Strip the `CDM:` prefix that the importer adds to created role names so
 * round-tripped exports look like the original input.
 */
function stripCdmRolePrefix(name: string): string {
  return name.startsWith('CDM: ') ? name.slice('CDM: '.length) : name;
}

/**
 * Extract the importer-owned `cdmSource` payload, dropping Grant's reserved
 * `cdmImport` envelope so the round-tripped export can be re-imported via
 * `mergeCdmImporterMetadata` without the reserved-key violation check firing.
 *
 * Returns `null` when the source has no importer metadata, matching the
 * optional shape of `RoleTemplateCdmInput.metadata`.
 */
function extractCdmSourceMetadata(
  metadata: Record<string, unknown>
): Record<string, unknown> | null {
  const source = metadata[CDM_SOURCE_METADATA_KEY];
  if (source == null || typeof source !== 'object' || Array.isArray(source)) {
    return null;
  }
  const out = { ...(source as Record<string, unknown>) };
  // Belt-and-suspenders: never let `cdmImport` leak into the export.
  delete out[CDM_IMPORT_METADATA_KEY];
  return Object.keys(out).length > 0 ? out : null;
}
