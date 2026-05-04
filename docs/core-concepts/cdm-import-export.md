---
title: CDM import & export
description: Import and export a project’s permission model as CDM JSON, async jobs, rollback snapshots, and APIs
---

# CDM import & export

Grant can **import** a project’s roles, groups, permissions, and user assignments from a **CDM (canonical data model)** JSON document, and **export** the current project back to the same shape. This supports cloning permission structure between projects, backups, and testing imports in isolation.

The dashboard surfaces this as **Import/Export** under each project (cards/table of jobs, import dialog, export action).

## Canonical payload shape

Imports and exports use **`SyncProjectPermissionsInput`** (GraphQL / codegen name): a versioned object with at least:

| Field                | Purpose                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| `cdmVersion`         | Schema version (currently `1` for the shipped handlers)                                          |
| `roleTemplates`      | Role templates with permission refs and metadata; carry optional `tagKeys` / `groupTagKeys`      |
| `userAssignments`    | Users mapped to templates / direct permission refs; carry optional `tagKeys` (global, see below) |
| `tags`               | Optional project tag definitions and `project_tags` membership                                   |
| `projectUserApiKeys` | Optional per-user API key identities (BYOK secrets, no plaintext on export)                      |
| `importId`           | Optional logical id; generated when omitted on enqueue                                           |

The `tags` section is opt-in: omit it to leave existing tag rows untouched. When included, `tagKeys` / `groupTagKeys` on roles and `tagKeys` on users are wired through `produced.tagIds` and must reference an entry in the same artifact's `tags` array. **`user_tags` are global** — re-importing them affects every project the user belongs to. See [Tags & Relationships → CDM lifecycle](/core-concepts/tags-relationships#cdm-lifecycle-for-tags) for the full contract.

The worker applies **replace-import** semantics for CDM-managed rows: existing CDM-sourced entities for that project are torn down, then the payload is applied in handler order. See [RBAC System](/architecture/rbac) for how roles, groups, and permissions relate.

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
