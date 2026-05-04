import {
  DbSchema,
  groups,
  groupTags,
  permissions,
  projectTags,
  projectUserApiKeys,
  resources,
  roles,
  roleTags,
  tags,
  userRoles,
  userTags,
} from '@grantjs/database';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';

import { Transaction } from '@/lib/transaction-manager.lib';

/** Resolved permission row for CDM linking (group_permissions, project_permissions). */
export type ResolvedCdmPermission = {
  id: string;
  resourceId: string | null;
};

/**
 * Read-side helpers for CDM permission sync (resolve refs, find prior import entities).
 */
export class ProjectPermissionSyncRepository {
  constructor(private readonly db: DbSchema) {}

  public listCdmRoleIdsForProject(projectId: string, transaction?: Transaction): Promise<string[]> {
    const db = transaction ?? this.db;
    return db
      .select({ id: roles.id })
      .from(roles)
      .where(
        and(
          isNull(roles.deletedAt),
          sql`${roles.metadata}->'cdmImport'->>'projectId' = ${projectId}`
        )
      )
      .then((rows) => rows.map((r) => r.id));
  }

  public listCdmGroupIdsForProject(
    projectId: string,
    transaction?: Transaction
  ): Promise<string[]> {
    const db = transaction ?? this.db;
    return db
      .select({ id: groups.id })
      .from(groups)
      .where(
        and(
          isNull(groups.deletedAt),
          sql`${groups.metadata}->'cdmImport'->>'projectId' = ${projectId}`
        )
      )
      .then((rows) => rows.map((r) => r.id));
  }

  /**
   * Resolve a permission by resource slug + action (case-insensitive) and optional condition / id.
   */
  public async resolvePermission(
    params: {
      resourceSlug: string;
      action: string;
      permissionId?: string | null;
      condition?: Record<string, unknown> | null;
    },
    transaction?: Transaction
  ): Promise<ResolvedCdmPermission> {
    const db = transaction ?? this.db;
    const slugNorm = params.resourceSlug.trim();
    const actionNorm = params.action.trim();

    if (params.permissionId) {
      const row = await db
        .select({
          p: permissions,
          slug: resources.slug,
        })
        .from(permissions)
        .innerJoin(resources, eq(permissions.resourceId, resources.id))
        .where(
          and(
            eq(permissions.id, params.permissionId),
            isNull(permissions.deletedAt),
            isNull(resources.deletedAt)
          )
        )
        .limit(1);
      if (row.length === 0) {
        throw new Error('PERMISSION_NOT_FOUND');
      }
      const slugMatch =
        row[0].slug.trim().toLowerCase() === slugNorm.toLowerCase() &&
        row[0].p.action.trim().toLowerCase() === actionNorm.toLowerCase();
      if (!slugMatch) {
        throw new Error('PERMISSION_REF_MISMATCH');
      }
      return { id: row[0].p.id, resourceId: row[0].p.resourceId };
    }

    const candidates = await db
      .select({
        p: permissions,
        slug: resources.slug,
      })
      .from(permissions)
      .innerJoin(resources, eq(permissions.resourceId, resources.id))
      .where(
        and(
          isNull(permissions.deletedAt),
          isNull(resources.deletedAt),
          sql`lower(${resources.slug}) = lower(${slugNorm})`,
          sql`lower(${permissions.action}) = lower(${actionNorm})`
        )
      );

    if (candidates.length === 0) {
      throw new Error('PERMISSION_NOT_FOUND');
    }

    const cond = params.condition;
    const matches = candidates.filter((c) => this.conditionMatches(c.p.condition, cond));
    if (matches.length === 0) {
      throw new Error('PERMISSION_CONDITION_MISMATCH');
    }
    if (matches.length > 1) {
      throw new Error('PERMISSION_AMBIGUOUS');
    }
    return { id: matches[0].p.id, resourceId: matches[0].p.resourceId };
  }

  private conditionMatches(
    stored: unknown,
    requested: Record<string, unknown> | null | undefined
  ): boolean {
    if (requested === undefined || requested === null) {
      return (
        stored == null || (typeof stored === 'object' && Object.keys(stored as object).length === 0)
      );
    }
    return JSON.stringify(stored ?? null) === JSON.stringify(requested);
  }

  /**
   * API key ids managed by CDM project-user-api-key handler for this project (pivot has `cdmImport`).
   */
  public async listCdmProjectUserApiKeyIdsForProject(
    projectId: string,
    transaction?: Transaction
  ): Promise<string[]> {
    const db = transaction ?? this.db;
    const rows = await db
      .select({ apiKeyId: projectUserApiKeys.apiKeyId })
      .from(projectUserApiKeys)
      .where(
        and(
          eq(projectUserApiKeys.projectId, projectId),
          isNull(projectUserApiKeys.deletedAt),
          sql`${projectUserApiKeys.metadata}->'cdmImport'->>'projectId' = ${projectId}`,
          sql`${projectUserApiKeys.metadata}->'cdmImport'->>'kind' = 'projectUserApiKey'`
        )
      );
    return rows.map((r) => r.apiKeyId);
  }

  public listActiveUserRolesForRoleIds(
    roleIds: string[],
    transaction?: Transaction
  ): Promise<Array<{ userId: string; roleId: string }>> {
    if (roleIds.length === 0) {
      return Promise.resolve([]);
    }
    const db = transaction ?? this.db;
    return db
      .select({ userId: userRoles.userId, roleId: userRoles.roleId })
      .from(userRoles)
      .where(and(inArray(userRoles.roleId, roleIds), isNull(userRoles.deletedAt)));
  }

  /**
   * Tag ids managed by the CDM tag handler for this project. Identified via
   * `tags.metadata.cdmImport.projectId` + `kind = 'tag'` so we only delete CDM
   * tags belonging to this project (never user-created ones).
   */
  public async listCdmTagIdsForProject(
    projectId: string,
    transaction?: Transaction
  ): Promise<string[]> {
    const db = transaction ?? this.db;
    const rows = await db
      .select({ id: tags.id })
      .from(tags)
      .where(
        and(
          isNull(tags.deletedAt),
          sql`${tags.metadata}->'cdmImport'->>'projectId' = ${projectId}`,
          sql`${tags.metadata}->'cdmImport'->>'kind' = 'tag'`
        )
      );
    return rows.map((r) => r.id);
  }

  /**
   * Soft-delete CDM-marked tag rows together with their pivot memberships.
   * The pivots are soft-deleted (rather than relying on FK cascade, which only
   * fires on hard delete) so subsequent reads immediately reflect the teardown.
   *
   * Touches: `project_tags` (this project only), `role_tags`, `group_tags`,
   * `user_tags` referencing the given tag ids, and the `tags` rows themselves.
   */
  public async bulkSoftDeleteCdmTags(
    tagIds: string[],
    projectId: string,
    transaction?: Transaction
  ): Promise<void> {
    if (tagIds.length === 0) return;
    const db = transaction ?? this.db;
    const now = new Date();

    await db
      .update(projectTags)
      .set({ deletedAt: now, updatedAt: now })
      .where(
        and(
          eq(projectTags.projectId, projectId),
          inArray(projectTags.tagId, tagIds),
          isNull(projectTags.deletedAt)
        )
      );

    await db
      .update(roleTags)
      .set({ deletedAt: now, updatedAt: now })
      .where(and(inArray(roleTags.tagId, tagIds), isNull(roleTags.deletedAt)));

    await db
      .update(groupTags)
      .set({ deletedAt: now, updatedAt: now })
      .where(and(inArray(groupTags.tagId, tagIds), isNull(groupTags.deletedAt)));

    await db
      .update(userTags)
      .set({ deletedAt: now, updatedAt: now })
      .where(and(inArray(userTags.tagId, tagIds), isNull(userTags.deletedAt)));

    await db
      .update(tags)
      .set({ deletedAt: now, updatedAt: now })
      .where(and(inArray(tags.id, tagIds), isNull(tags.deletedAt)));
  }
}
