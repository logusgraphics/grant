# CDM (canonical data model) extension contract

This folder contains the entity-handler registry that powers project permission
sync, export, and pre-sync rollback snapshots. The orchestrator
(`ProjectPermissionSyncService`) and the exporter
(`ProjectPermissionExportService`) both iterate the same `ICdmEntityHandler[]`
registry; adding a new entity is a localised change here and a matching schema
addition in `@grantjs/schema`.

## Where the moving pieces live

| Concern                   | Location                                                               |
| ------------------------- | ---------------------------------------------------------------------- |
| Port definition           | `packages/@grantjs/core/src/ports/services/cdm-entity-handler.port.ts` |
| Default registry          | `apps/api/src/services/cdm/index.ts` (`createDefaultCdmHandlers`)      |
| Sync orchestrator         | `apps/api/src/services/project-permission-sync.service.ts`             |
| Export orchestrator       | `apps/api/src/services/project-permission-export.service.ts`           |
| Worker snapshot capture   | `apps/api/src/jobs/project-permissions-sync.job.ts`                    |
| Permission-ref helper     | `apps/api/src/services/cdm/permission-ref.helper.ts`                   |
| Shared role+group builder | `apps/api/src/services/cdm/cdm-entity-builder.ts`                      |

## How to add a new CDM entity handler

Walk-through for adding e.g. `apiKeys`:

1. **Add the input + output GraphQL types** in `@grantjs/schema` and re-run
   `pnpm --filter @grantjs/schema generate` so `SyncProjectPermissionsInput`
   gains a new array slot (e.g. `apiKeys: ApiKeyCdmInput[]`) and the matching
   server-side resolvers compile.
2. **Implement `ICdmEntityHandler`** in a new file under
   `apps/api/src/services/cdm/<entity>.handler.ts`:
   - `handlerKind` — stable identifier, persisted under
     `metadata.cdmImport.kind` so teardown can find rows this handler created.
   - `inputKey` — the new field name on `SyncProjectPermissionsInput`.
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
   - integration — extend the project-permissions-sync integration test so a
     full sync round-trip exercises the new entity.

## Metadata convention

Every handler-managed row must carry `metadata.cdmImport`:

```ts
metadata.cdmImport = {
  projectId: '<owning project>',
  kind: '<handlerKind>',
  externalKey: '<optional caller-supplied key>',
};
```

The `cdmImport` block is reserved for the registry; it is what `teardown`
queries to find prior rows. Importer-supplied metadata goes under
`metadata.cdmSource` and is merged via `mergeCdmImporterMetadata` so callers
cannot accidentally overwrite the reserved block.

For entities tied to projects only through pivot tables (e.g. tags, where
`project_tags` is the membership row), `teardown` must also soft-delete the
pivot rows that reference the row being removed — soft-delete cascades do not
fire on the FK side. See `TagHandler.teardown` and
`ProjectPermissionSyncRepository.bulkSoftDeleteCdmTags` for the canonical
pattern.

## Cross-handler refs (`produced`)

`CdmProducedRefs` is the registry's shared scratchpad: earlier handlers
publish ids that later handlers consume. The current invariants are:

| Producer (order)          | Consumes                                     | Field             |
| ------------------------- | -------------------------------------------- | ----------------- |
| `tag` (5)                 | —                                            | `tagIds`          |
| `roleTemplate` (10)       | `tagIds`                                     | `roleTemplateIds` |
| `userAssignment` (20)     | `roleTemplateIds`, `tagIds`                  | —                 |
| `projectUserApiKey` (300) | `assignmentUserIds` (set, not in `produced`) | —                 |

When you add a new producer, extend `CdmProducedRefs` in
`@grantjs/core/src/ports/services/cdm-entity-handler.port.ts` with a
namespaced `Map<externalKey, id>` field and document the consumers above.

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
  `startProjectPermissionsSync`.
- Snapshot retention / compaction — drop snapshots older than N days for
  cancelled / failed jobs once usage patterns are clearer.
