---
title: CDM import & export
description: Import and export a project’s permission model as CDM JSON, async jobs, rollback snapshots, and APIs
---

# CDM import & export

CDM is for **porting a project's full auth graph between Grant instances or
from an external system into Grant** — not just round-tripping within one
Grant. The exporter emits a self-contained document; the importer creates new
entities for CDM-owned definitions (roles, tags, custom resources, optional
provisioned users); global catalog rows may be **referenced** rather than
copied (see below).

## Global permission catalog vs CDM-owned rows (alignment)

**Product stance:** Imports resolve standard grants via the **global** `resources`
and `permissions` tables (`permissionRefs` using `resourceSlug` + `action` [+
`condition`]). Those rows are **shared across all projects** in the Grant
instance. Editing a catalog permission or resource affects **every** role and
project that references it. CDM sections `resources` / `permissions` list only
**project-scoped CDM-created** definitions (`metadata.cdmImport`), not the full
system catalog—so export JSON often has **empty** `resources` / `permissions`
when the project only uses seeded/system permissions.

Operators who need **strict isolation** between cloned or ported projects (so
that editing catalog rows in one place cannot affect another) require a
**portable-catalog fork** strategy—that is a substantial follow-on change.
Until then, treat global catalog definitions as **product-wide** for editing.

### `roles[].permissions` and `users[].permissions` (public JSON strings)

Each entry is either (1) an **opaque key** equal to `permissions[].key` in the same document, or (2) a **catalog reference** `"{resourceSlug}:{action}"` where both sides are normalized with the same slug rules Grant uses for permission resolution (lowercase, hyphenated words). Resource slugs in this encoding **must not contain `:`**; the first colon separates slug from action. On export, catalog-backed grants that are not CDM-marked in `permissions[]` appear as these `slug:action` strings so the artifact stays self-describing even when `resources` / `permissions` are empty.

## Provisioned users (`users` section)

Optional **`users`** entries define **new** Grant users for inbound porting;
assignments may reference them via **`userKey`**. Existing users continue to be
referenced by **`userId`**. See [`SyncProjectPermissionsInput`](https://github.com/logusgraphics/grant-platform/blob/main/packages/@grantjs/schema/src/schema/projects/inputs/sync-project-permissions-cdm.graphql)
in the schema package.
Operators use the dashboard's **Import/Export** screen under each project
(cards/table of jobs, import dialog, export action) for ad-hoc clones,
backups, and testing imports in isolation.

## Canonical payload shape

Imports and exports use **`SyncProjectPermissionsInput`** (GraphQL / codegen name): a versioned object with at least:

| Field         | Purpose                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------ |
| `version`     | Schema version (currently `1`)                                                                   |
| `id`          | Optional correlation id for audit/idempotency                                                    |
| `mode`        | Controlled execution policy (`strategy`, `onConflict`, `confirmDestructive`)                     |
| `resources`   | Optional custom project resources + `project_resources` membership                               |
| `permissions` | Optional custom project permissions + `project_permissions` membership                           |
| `groups`      | Optional explicit group definitions and permission grouping                                      |
| `roles`       | Role definitions with optional `groups`, `permissions`, and tag attachments                      |
| `users`       | Unified user definitions/resolution + role/group/permission/tag assignments + optional user keys |
| `tags`        | Optional project tag definitions and `project_tags` membership                                   |

Every section is opt-in. When `permissions` is included, `resources` must also be included so each permission resource reference resolves inside the same document. The import pipeline normalizes user hierarchy (`user -> role -> group -> permission`) and fills unresolved direct-user permission gaps through deterministic synthetic role/group chains.

`user_tags` are global — re-importing them affects every project the user belongs to. See [Tags & Relationships → CDM lifecycle](/core-concepts/tags-relationships#cdm-lifecycle-for-tags) for the full contract.

The worker applies **replace-import** semantics for CDM-managed rows: existing CDM-sourced entities for that project are torn down, then the payload is applied in handler order. See [RBAC System](/architecture/rbac) for how roles, groups, and permissions relate.

## Identity contract: opaque external keys

Every CDM-portable entity is identified by an opaque `externalKey`:

- **Importer-supplied** keys are accepted as-is and must be unique within their section. Treat them as opaque strings; Grant only requires uniqueness.
- **Grant-emitted** keys (export) are derived, non-UUID-looking strings such as `cdm-tag-3f2a9b1c0d1e2f30`, generated by `buildExternalKey(kind, ...inputs)`. They are stable across re-exports of the same row but distinct across re-imports because the new row has a new id and the hash includes it.
- **Original Grant ids** stay inside `metadata.cdmSource` (e.g. `grantTagId`, `grantRoleId`, `grantPermissionId`) for traceability — never as identity in cross-references.
- **Users:** reference an existing account with `userAssignments[].userId`, or define new users in the optional `users` section and set `userAssignments[].userKey` to match `users[].externalKey`. Provisioned users are global and can be re-exported with `metadata.cdmSource.grantUserId` for traceability.

Permission references inside `roleTemplates[].permissionRefs[]` and `userAssignments[].directPermissionRefs[]` resolve in this order on import:

1. `permissionKey` against permissions declared in the same CDM document (`produced.permissionIds`).
2. `permissionId` against an existing Grant permission UUID (kept for back-compat with payloads produced before this contract; new exports do not emit it).
3. `(resourceSlug, action [, condition])` against the global / system catalog. Used for system permissions that stay outside CDM.

## Permissions (dashboard)

| Action                         | Grant permission       | Notes                          |
| ------------------------------ | ---------------------- | ------------------------------ |
| Start import (upload CDM JSON) | `Project` **`Update`** | Enqueues an async job          |
| Export current project         | `Project` **`Query`**  | Immediate download; no job row |
| View job list & job details    | `Project` **`Query`**  | GraphQL / REST read APIs       |
| Cancel a queued job            | `Project` **`Update`** | Best-effort if already running |

Scoped context must match the project (organization or personal account project), consistent with other project-scoped screens.

## User flow (web)

1. Open **Project → Import/Export** (`…/projects/{projectId}/import-export`).
2. **Import** — choose a `.json` file; the app validates shape, then enqueues a job via GraphQL. The **original payload** is stored on the job for later review.
3. **Export** — downloads the **current** project state as CDM JSON (filename includes project id and timestamp).
4. The list **polls** while any visible job is `PENDING` or `RUNNING`, then shows terminal status and counts when completed.
5. **Job details** — status fields, **Result** counters after success, **Payload** (submitted JSON), **Rollback snapshot** when present (see below).

```bmermaid diagram-narrow
sequenceDiagram
  participant U as Operator
  participant API as Grant API
  participant W as Sync worker

  U->>API: Start import (CDM JSON)
  API-->>U: Job enqueued (pending)
  W->>API: Transaction: export snapshot → save on job → apply CDM
  API-->>U: Job completed (poll / subscription)
```

## Async jobs

Each import is a **row** in `project_permission_sync_jobs`, executed by the background job adapter ([Job scheduling](/advanced-topics/job-scheduling)). Lifecycle states include pending, running, completed, failed, and cancelled.

- **Query / poll** — GraphQL `projectPermissionsSyncJobs` / `projectPermissionsSyncJob`, or REST equivalents (see below).
- **Payload download** — REST returns the **submitted** CDM JSON for auditing (`GET …/sync-jobs/{jobId}/payload`).

## Pre-sync rollback snapshot

Before applying an import, the worker captures a **full CDM export** of the project **inside the same database transaction** as the import, then persists it on the job row. If the import fails, that snapshot is rolled back with the transaction.

- **Metadata** on the job (`hasSnapshot`, `snapshotTakenAt`, `snapshotSizeBytes`) is exposed via GraphQL for list/detail UIs.
- **Bytes** are downloaded via REST (`GET …/sync-jobs/{jobId}/snapshot`), not inlined in GraphQL (same pattern as payload).

::: tip
Automated “rollback” as a one-click replay is not part of the product UI yet; the artifact is there for operators who download JSON and start a new import. Future **BYOK**-style secrets in CDM would require re-supplying secrets when replaying a snapshot — see the extension README linked below.
:::

## REST endpoints (summary)

All routes are under **`/api/projects/{id}/…`** with authenticated access and project scope query params (`scopeId`, `tenant`) as documented in OpenAPI.

| Method   | Path                                       | Role                                                       |
| -------- | ------------------------------------------ | ---------------------------------------------------------- |
| `GET`    | `…/permissions/export`                     | Download current project CDM (`cdmVersion` query optional) |
| `GET`    | `…/permissions/sync-jobs`                  | List jobs (if exposed for your client)                     |
| `POST`   | `…/permissions/sync-jobs`                  | Enqueue import (body = CDM JSON)                           |
| `GET`    | `…/permissions/sync-jobs/{jobId}`          | Single job status                                          |
| `GET`    | `…/permissions/sync-jobs/{jobId}/payload`  | Submitted CDM JSON                                         |
| `GET`    | `…/permissions/sync-jobs/{jobId}/snapshot` | Pre-sync rollback JSON (404 if none)                       |
| `DELETE` | `…/permissions/sync-jobs/{jobId}`          | Cancel job                                                 |

Authoritative request/response shapes live in **OpenAPI** ([REST API](/api-reference/rest-api)) and `@grantjs/schema` codegen.

## GraphQL (summary)

Typical operations:

- **`startProjectPermissionsSync`** — enqueue import (input includes project scope + CDM payload).
- **`cancelProjectPermissionsSync`** — cancel a job.
- **`projectPermissionsSyncJobs`** — paginated list (sort, filter, search).
- **`projectPermissionsSyncJob`** — single job by id.

Full operation documents are in `packages/@grantjs/schema` for client code generation.

## Metadata on imported rows (`cdmImport` / `cdmSource`)

Rows created or managed by CDM carry **`metadata.cdmImport`**: `projectId`,
`kind`, and `externalKey`. Grant uses this for **replace-import teardown**
(finding prior rows to remove), **export filtering** (what belongs in CDM
sections), and correlation—not only for rollback snapshots. **`metadata.cdmSource`**
holds importer-owned JSON and Grant trace ids (`grantTagId`, `grantRoleId`,
`grantUserId`, …). See the API [CDM README](https://github.com/logusgraphics/grant-platform/blob/main/apps/api/src/services/cdm/README.md).

## Future: portable catalog fork (optional product extension)

Materializing **copies** of global catalog permissions per import (so edits in one
project never affect another) would require coordinated changes to resolution,
export, and slug/uniqueness rules. This is **not** shipped in the current
alignment track; document expectations above until such a mode exists.

## Extending the CDM (contributors)

New entity types (e.g. API keys later) are added via an **`ICdmEntityHandler`** registry shared by sync and export. Implementation notes, metadata rules, and **BYOK** policy for secret-bearing entities are maintained in the API tree:

- [`apps/api/src/services/cdm/README.md`](https://github.com/grant-js/grant/blob/main/apps/api/src/services/cdm/README.md)

That document is the source of truth for **handler order**, `cdmVersion` bumps, and tests.

---

**Related**

- [RBAC System](/architecture/rbac) — roles, groups, permissions
- [Job scheduling](/advanced-topics/job-scheduling) — background workers
- [REST API](/api-reference/rest-api) — OpenAPI and conventions
- [Transport layers](/api-reference/transport-layers) — GraphQL vs REST
