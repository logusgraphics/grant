# Changelog

All notable platform releases (apps, Docker images, and publishable npm packages) are documented here.
Package-specific histories also live under `packages/@grantjs/*/CHANGELOG.md`.

## 1.0.0

### Platform

Initial semver release of the Grant platform.

**Docker images** (GHCR, `ghcr.io/grant-js/grant/`):

- `grant-api`
- `grant-web`
- `grant-docs`
- `example-nextjs`

Tags: `:1.0.0`, `:latest` (from current `:demo` build). Rolling demo continues to use `:demo` and `:sha-<commit>`.

**npm packages** (registry.npmjs.org):

- `@grantjs/schema@1.0.0`
- `@grantjs/client@1.0.1` (includes MFA step-up callback)
- `@grantjs/server@1.0.0`
- `@grantjs/cli@1.0.0`

### Highlights

- Multi-tenant RBAC API (GraphQL + REST), web dashboard, and documentation site
- Publishable SDKs: browser client, server adapters, CLI
- Demo deployment via Docker Compose (`:demo` images + `.env.demo`)

## 1.1.0

### Platform

Async CDM project sync jobs, export, and pre-sync rollback snapshots. **Breaking:** synchronous `syncProject` / `POST .../permissions/sync` removed — use enqueue-and-poll job APIs (see migration notes in package changelogs).

**Docker images:** tagged `:1.1.0` and `:latest` after this release.

**npm packages:** `@grantjs/schema`, `@grantjs/client`, `@grantjs/server`, `@grantjs/cli` at **1.1.0** (fixed group with apps).
