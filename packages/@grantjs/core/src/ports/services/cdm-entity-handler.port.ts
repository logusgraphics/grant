/**
 * CDM (canonical data model) entity handler port.
 *
 * The project permission sync orchestrator (`IProjectPermissionSyncService`)
 * delegates per-entity work — validation, permission-ref collection,
 * teardown, apply, and export — to an ordered registry of handlers
 * implementing this port. Adding a new CDM entity (API keys, project apps,
 * etc.) means implementing this port and registering it with the appropriate
 * `order`; the orchestrator does not need to change.
 */
import type {
  Scope,
  SyncProjectPermissionsInput,
  SyncProjectPermissionsResult,
} from '@grantjs/schema';

/**
 * Permission reference shape collected from CDM input. Used by the orchestrator
 * to deduplicate and resolve permissions across all handlers in a single pass
 * before any handler runs `apply`.
 */
export interface CdmPermissionRefSpec {
  resourceSlug: string;
  action: string;
  permissionId?: string | null;
  condition?: Record<string, unknown> | null;
}

/**
 * Resolved Grant permission row, opaque to the port. The orchestrator keeps
 * implementation-specific shapes inside its `lookupResolvedRef` closure;
 * handlers cast as needed.
 */
export type CdmResolvedPermission = unknown;

/**
 * Cross-handler shared state. Earlier handlers may publish ids that later
 * handlers consume (e.g. `roleTemplate` external-key → role id, consumed by
 * `userAssignment` to link users to roles).
 *
 * Add a new namespaced field per handler that needs to publish state.
 */
export interface CdmProducedRefs {
  /**
   * External-key → created role id.
   * Populated by the role-template handler during `apply`, consumed by the
   * user-assignment handler to map `roleTemplateKeys` to role ids.
   */
  roleTemplateIds: Map<string, string>;
}

export interface CdmTeardownContext {
  projectId: string;
  scope: Scope;
  /** Opaque transaction handle; cast in the implementation. */
  tx: unknown;
}

export interface CdmApplyContext {
  projectId: string;
  scope: Scope;
  /** Opaque transaction handle; cast in the implementation. */
  tx: unknown;
  /** Lookup a previously-resolved permission by its CDM ref shape. */
  lookupResolvedRef: (ref: CdmPermissionRefSpec) => CdmResolvedPermission;
  /** Mutable result counters; handlers increment their relevant fields. */
  result: SyncProjectPermissionsResult;
  /** Cross-handler shared state. */
  produced: CdmProducedRefs;
  /**
   * `userId`s listed on this import's `userAssignments` (for handlers that must
   * only attach entities to users declared in the same payload).
   */
  assignmentUserIds: ReadonlySet<string>;
}

export interface CdmExportContext {
  projectId: string;
  scope: Scope;
  /** Optional transaction handle; export is read-only but may be invoked from inside the import transaction (snapshot capture). */
  tx?: unknown;
}

/**
 * Unit of CDM responsibility: validates and applies one section of
 * `SyncProjectPermissionsInput`, tears it down for replace-import semantics,
 * and exports the project's current state back to the same input shape.
 *
 * Type parameters:
 *   - `TInput`  shape of one entry in `SyncProjectPermissionsInput[inputKey]`
 *   - `TExport` shape returned by `export(...)`, typically equal to `TInput`
 */
export interface ICdmEntityHandler<TInput = unknown, TExport = TInput> {
  /** Stable identifier for this handler (e.g. `'roleTemplate'`, `'userAssignment'`). */
  readonly handlerKind: string;
  /**
   * Field on `SyncProjectPermissionsInput` this handler reads and writes.
   * Must be one of the array-typed keys (e.g. `'roleTemplates'`, `'userAssignments'`).
   */
  readonly inputKey: keyof SyncProjectPermissionsInput;
  /** Order within the sync/export pipeline. Lower runs earlier. */
  readonly order: number;

  /** Throw `ValidationError` for shape/semantic violations specific to this entity. */
  validateInput(input: readonly TInput[]): void;

  /** Permission references this handler needs resolved before `apply`. */
  collectPermissionRefs(input: readonly TInput[]): readonly CdmPermissionRefSpec[];

  /** Replace-import: delete prior CDM-marked entities owned by this handler. */
  teardown(ctx: CdmTeardownContext): Promise<void>;

  /** Apply this handler's slice of the CDM input, mutating shared `result` and `produced`. */
  apply(ctx: CdmApplyContext, input: readonly TInput[]): Promise<void>;

  /** Export project's current state back into this handler's input shape. */
  export(ctx: CdmExportContext): Promise<readonly TExport[]>;
}
