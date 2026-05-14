# CDM (canonical data model) extension contract

This folder contains the entity-handler registry that powers project permission
sync, export, and pre-sync rollback snapshots. The orchestrator
(`ProjectSyncService`) and the exporter
(`ProjectPermissionExportService`) both iterate the same `ICdmEntityHandler[]`
registry; adding a new entity is a localised change here and a matching schema
addition in `@grantjs/schema`.

## Where the moving pieces live

| Concern                   | Location                                                               |
| ------------------------- | ---------------------------------------------------------------------- |
| Port definition           | `packages/@grantjs/core/src/ports/services/cdm-entity-handler.port.ts` |
| Default registry          | `apps/api/src/services/cdm/index.ts` (`createDefaultCdmHandlers`)      |
| Sync orchestrator         | `apps/api/src/services/project-sync.service.ts`                        |
| Export orchestrator       | `apps/api/src/services/project-permission-export.service.ts`           |
| Worker snapshot capture   | `apps/api/src/jobs/project-sync.job.ts`                                |
| Permission-ref helper     | `apps/api/src/services/cdm/permission-ref.helper.ts`                   |
| Shared role+group builder | `apps/api/src/services/cdm/cdm-entity-builder.ts`                      |

## How to add a new CDM entity handler

Walk-through for adding e.g. `apiKeys`:

1. **Add the input + output GraphQL types** in `@grantjs/schema` and re-run
   `pnpm --filter @grantjs/schema generate` so `SyncProjectInput`
   gains a new array slot (e.g. `apiKeys: ApiKeyCdmInput[]`) and the matching
   server-side resolvers compile.
2. **Implement `ICdmEntityHandler`** in a new file under
   `apps/api/src/services/cdm/<entity>.handler.ts`:
   - `handlerKind` — stable identifier, persisted under
     `metadata.cdmImport.kind` so teardown can find rows this handler created.
   - `inputKey` — the new field name on `SyncProjectInput`.
   - `order` — lower numbers run earlier; pick a number after every dependency
     (e.g. role templates use `100`, user assignments `200`).
   - `validateInput(input)` — throw `ValidationError` for shape/semantic
     violations specific to your entity (the orchestrator runs a global
     `cdmVersion` check, but per-entity rules belong here).
   - `collectPermissionRefs(input)` — return every permission this handler
     references; the orchestrator deduplicates and resolves them in a single
     pass before any handler runs `apply`.
   - `teardown(ctx)` — replace-import semantics: delete every prior CDM-marked
     row owned by this handler. Find them via the `metadata.cdmImport.kind ==
'<handlerKind>'` marker.
   - `apply(ctx, input)` — write the new state. Mutate `ctx.result` counters
     and publish anything later handlers need into `ctx.produced` (e.g. the
     `roleTemplate` handler publishes external-key → role id; the `tag`
     handler publishes external-key → tag id, consumed by both
     `roleTemplate` and `userAssignment` to wire `role_tags` / `group_tags` /
     `user_tags`).
   - `export(ctx)` — round-trip support: read the project's current state and
     return it shaped like your `inputKey`. Reuse joins from the export repo
     (`ProjectPermissionExportRepository`) where possible.
3. **Register the handler** in `createDefaultCdmHandlers` (`./index.ts`).
   Append it to the returned array sorted by `order`.
4. **Bump `cdmVersion`** only when a non-additive change is made (renamed
   field, removed required field, etc.). Pure additions stay on `1` and old
   payloads keep working.
5. **Add tests**:
   - registry behaviour — `tests/unit/services/cdm-handler-registry.test.ts`
     should still pass; add a case if your handler depends on `produced`
     state from an earlier handler.
   - handler-specific — drop a `tests/unit/services/<entity>.handler.test.ts`
     covering `validateInput`, `apply`, `teardown`, and `export`.
   - integration — extend the `project-sync.integration.test.ts` so a
     full sync round-trip exercises the new entity.

## Identity contract

CDM is for **porting a project's auth graph between Grant instances or from an
external system into Grant** — not just round-tripping within one Grant. The
contract treats `externalKey` as opaque to Grant: an importer-supplied stable
string that's unique within the document. Original Grant ids stay inside
metadata for traceability and never appear as identity.

```
metadata.cdmImport = { projectId, kind, externalKey }   // Grant-reserved (teardown lookup)
metadata.cdmSource = { ...importer JSON,
                       grantTagId / grantRoleId / ... } // importer + traceability
externalKey                                              // opaque, importer-supplied, unique within doc
```

Grant's exporter emits derived, non-UUID-looking keys via
[`buildExternalKey`](./identity.helper.ts) (e.g. `cdm-tag-3f2a9b1c0d1e2f30`).
The id is stable across re-exports of the same row but distinct across
re-imports because the new row has a new id and the hash includes it. Test for
the absence of UUID-shaped externalKeys in CDM exports as a quick way to spot
identity leaks.

User identity now supports a unified CDM `users[]` section with resolver-style
keys (`key` string/object). Imports normalize user access through Grant's
hierarchy (`user -> role -> group -> permission`) and avoid direct permission
sprawl by synthesizing deterministic role/group links where needed.

## Mode policy

`SyncProjectInput.mode` controls import behavior:

- `strategy: merge | replace`
- `onConflict: fail | skip | update` (merge path)
- `confirmDestructive: boolean` (required when `strategy=replace`)

Export serializes the canonical neutral model and does not execute mode policy.

## Metadata convention

Every handler-managed row must carry `metadata.cdmImport`:

```ts
metadata.cdmImport = {
  projectId: '<owning project>',
  kind: '<handlerKind>',
  externalKey: '<opaque key emitted on export, supplied on import>',
};
```

The `cdmImport` block is reserved for the registry; it is what **`teardown`**
queries to find prior rows, what **export** uses to decide which rows belong in
CDM sections (e.g. CDM-marked resources vs global catalog), and how replace-import
correlates teardown—not **only** for rollback snapshots. Importer-supplied
metadata goes under `metadata.cdmSource` and is merged via
`mergeCdmImporterMetadata` so callers cannot accidentally overwrite the reserved block.

**Global catalog:** Grant does not duplicate seeded `resources` / `permissions`
rows per project by default; many projects reference the same catalog ids via
pivots and permission refs. Editing those rows is instance-wide until an
optional portable fork strategy ships (see product docs).

For entities tied to projects only through pivot tables (e.g. tags, where
`project_tags` is the membership row), `teardown` must also soft-delete the
pivot rows that reference the row being removed — soft-delete cascades do not
fire on the FK side. See `TagHandler.teardown` and
`ProjectSyncRepository.bulkSoftDeleteCdmTags` for the canonical
pattern.

## Cross-handler refs (`produced`)

`CdmProducedRefs` is the registry's shared scratchpad: earlier handlers
publish ids that later handlers consume. The current invariants are:

| Producer (order)          | Consumes                                     | Field           |
| ------------------------- | -------------------------------------------- | --------------- |
| `resource` (2)            | —                                            | `resourceIds`   |
| `permission` (4)          | `resourceIds`                                | `permissionIds` |
| `tag` (5)                 | —                                            | `tagIds`        |
| `roleTemplate` (10)       | `tagIds`, `permissionIds`                    | `roleIdsByKey`  |
| `userAssignment` (20)     | `roleIdsByKey`, `tagIds`, `permissionIds`    | —               |
| `projectUserApiKey` (300) | `assignmentUserIds` (set, not in `produced`) | —               |

When you add a new producer, extend `CdmProducedRefs` in
`@grantjs/core/src/ports/services/cdm-entity-handler.port.ts` with a
namespaced `Map<externalKey, id>` field and document the consumers above.

## Resolution order for permission refs

`PermissionRefCdmInput` has three optional resolution modes; on apply the
orchestrator tries them in this order:

1. **`permissionKey`** against `produced.permissionIds` — the permission was
   declared in the same CDM document by the `permission` handler. This is the
   recommended path for full-project porting.
2. **`permissionId`** against an existing Grant permission UUID — kept for
   backward compatibility with payloads produced before this change. New
   exports do not emit `permissionId`.
3. **`(resourceSlug, action [, condition])`** against the global catalog —
   used for system / global permissions that stay outside CDM.

References to system or global resources/permissions stay outside CDM by
design. The exporter only emits resources/permissions it owns (filtered via
`metadata.cdmImport.projectId`); the importer continues to reference Grant's
system catalog by `resourceSlug + action`.

## BYOK (bring your own key) policy for secret-bearing entities

This policy applies to any future handler whose entity has a secret component
(API keys, project apps, OAuth client secrets, webhook signing keys, etc.).
At the time of writing, no such handler ships with this codebase — but the
policy is captured here so the first one to land (likely `apiKeys`) follows
it from day one.

### Export emits identity, scopes, and metadata only

CDM export must never re-emit hashed secrets, even when the handler can read
them, because the original plaintext cannot be recovered. The export shape
includes exactly:

- the entity's stable identity (id, name, externalKey if any),
- its scopes / permissions / role links,
- its `metadata.cdmSource`.

### Import requires the operator to supply secrets at submit-time

Handlers for secret-bearing entities take `{ ..., secret }` (or the equivalent
shape) in their input. Missing secrets cause a `ValidationError` at
`validateInput` time. Generated-on-import is **not** the model — the CDM
artifact stays deterministic and the API never returns plaintext secrets to
the caller.

### Snapshots are informational for secret-bearing entities

The pre-sync rollback snapshot uses the same export pipeline, so a snapshot
restores identity / scopes / metadata but cannot restore secrets. When a
secret-bearing handler is added, the UI snapshot tab needs to surface this
clearly: replaying the snapshot will require operators to re-supply secrets
for those rows.

## Out-of-scope

- A "rollback" action that automatically replays the saved snapshot — the
  artifact and download path are in place, so this is a one-button addition
  later. For secret-bearing entities, the rollback UI must prompt for the
  BYOK secrets before submitting the snapshot back through
  `startProjectSync`.
- Snapshot retention / compaction — drop snapshots older than N days for
  cancelled / failed jobs once usage patterns are clearer.
