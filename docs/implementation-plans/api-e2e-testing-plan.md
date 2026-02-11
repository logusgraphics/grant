# API End-to-End Testing Plan

This document outlines how to add a full end-to-end (E2E) test suite for the Grant API, using Docker Compose to run the **real API** (built from the same Dockerfile used for deployment), plus Postgres and Redis. Tests run against the live container over HTTP to verify the same image and runtime that will be deployed.

---

## 1. Goals

- **Run the real app in Docker** for E2E: the API service in `docker-compose.e2e.yml` is built from the **deployment Dockerfile** (same image as staging/production), ensuring E2E validates the actual deployed stack.
- **Mount full test environment** via Docker Compose: Postgres, Redis, and the API container; tests run on the host (or in CI) and hit the API over HTTP.
- **Verify critical flows** against the real API stack (Express, REST, GraphQL, DB, cache):
  - Register (email) → verify email → login
  - Create secondary account (personal ↔ organization)
  - Exchange API key for token (`POST /api/auth/token`)
  - Create organization → invite members → accept invitation
  - Create projects (under account/organization)
- **Prepare the stack for deployment**: the API Dockerfile and compose layout are production-ready; E2E reuses them so the path from test to deploy is a single, consistent build.
- **CI-friendly**: runnable in GitHub Actions (or similar) with `docker compose -f docker-compose.e2e.yml up -d`, run migrations, then `pnpm test:e2e` against the API base URL.

---

## 2. Current Stack (What We Keep)

| Layer       | Current choice           | Role in E2E                                                                 |
| ----------- | ------------------------ | --------------------------------------------------------------------------- |
| Test runner | **Vitest**               | Run E2E suite on host/CI; `beforeAll` wait for API health, then run tests.  |
| HTTP client | **supertest**            | Send requests to **base URL** (e.g. `http://localhost:4000`) — real HTTP.   |
| API         | Express + REST + GraphQL | Runs **inside a container** built from the deployment Dockerfile.           |
| DB          | Postgres (Drizzle)       | In container; migrations run from host (or migrate job) before API starts.  |
| Cache       | Redis                    | In container; API uses Redis for cache/rate limit in E2E.                   |
| Config      | `config` from env        | Env passed into API container: `DB_URL`, `REDIS_*`, `CACHE_STRATEGY=redis`. |

No new test framework is required. Vitest + supertest run on the host and target the API container over the network.

---

## 3. Recommended Tools Summary

| Need                        | Tool / approach                       | Notes                                                                                             |
| --------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Test runner                 | **Vitest**                            | Already used; supports `test.e2e.ts` and env.                                                     |
| HTTP against API            | **supertest**                         | Already used; `request(app)` or `request(baseUrl)`.                                               |
| Test DB + Redis             | **Docker Compose**                    | Explicit requirement; separate from dev.                                                          |
| App under test              | **Extracted app factory**             | New: build Express app with injected DB/cache so we don’t start a real process (faster, no port). |
| Migrations                  | **drizzle-kit migrate**               | Run once before E2E (script or `beforeAll`).                                                      |
| Env for E2E                 | **`.env.e2e` or env vars in script**  | `DB_URL`, `REDIS_*`, `CACHE_STRATEGY=redis`, `EMAIL_PROVIDER=console` (or test adapter).          |
| Email tokens (OTP/invite)   | **Test email adapter** or **DB read** | See “Email and tokens” below.                                                                     |
| Optional: start real server | **Node script**                       | If you prefer a real HTTP server, use `supertest(baseUrl)`; less recommended for speed.           |

We do **not** recommend introducing Playwright or a browser for _API_ E2E; Vitest + supertest is the right fit. Playwright can be added later for _web_ E2E if needed.

---

## 4. Architecture Choices

### 4.1 Real API in Docker (chosen approach)

- **API runs as a container** built from the **same Dockerfile** used for deployment (staging/production).
- **docker-compose.e2e.yml** defines three services:
  - **postgres**: test DB (e.g. `grant_e2e`), exposed port for migrations and for tests that read tokens from DB.
  - **redis**: test cache; API uses it for rate limit and entity cache.
  - **api**: built from the deployment Dockerfile; depends on `postgres` and `redis`; receives env via compose; exposes port (e.g. `4000`).
- **Tests run on the host** (or in CI): Vitest + supertest target `E2E_API_BASE_URL` (e.g. `http://localhost:4000`). No in-process app; every request goes over the network to the real container.
- **Deployment alignment**: The same image built for E2E can be tagged and pushed to your registry for deployment; the stack is deployment-ready by design.

### 4.2 Docker Compose E2E layout

- **Separate compose file** `docker-compose.e2e.yml`:
  - **postgres**: image `postgres:16-alpine`, DB `grant_e2e`, healthcheck; expose port (e.g. `5433`) so the host can run migrations and tests can query for tokens.
  - **redis**: image `redis:7-alpine`, healthcheck; expose port (e.g. `6380`) if needed for debugging; API connects via service name `redis` inside the network.
  - **api**: `build` from the API Dockerfile (context: monorepo root or `apps/api` as appropriate); `depends_on` postgres and redis with `condition: service_healthy`; env from compose or env_file (`.env.e2e`); `ports: ["4000:4000"]` (or chosen port).
- **Migrations**: Run **before** the API serves traffic. Options:
  - **From host**: After `docker compose up -d postgres redis`, run `DB_URL=postgresql://...@localhost:5433/grant_e2e pnpm db:migrate`, then start the `api` service (or use a small script that does this order).
  - **One-off migrate container**: A service that runs `db:migrate` and exits; `api` has `depends_on: migrate` with `condition: service_completed_successfully` (Compose v2.1+).
- Recommendation: **Option A** (separate compose file) for clarity and to avoid touching dev DB; run migrations from host in the E2E script for simplicity.

### 4.3 Database isolation

- Use a **dedicated test DB** (e.g. `grant_e2e`).
- **Before E2E suite**: run migrations once (`DB_URL=... pnpm --filter @grantjs/database db:migrate` or equivalent).
- **Per test**: either
  - **Truncate** key tables between tests (slower but simple), or
  - **Transactional rollback** if you expose a way to run the app’s request within a transaction and roll back (more complex), or
  - **Unique data** per test (e.g. unique emails, org names) and accept shared DB state (simplest; recommended to start).

Starting with **unique data per test** keeps the setup minimal; you can add truncation or transactions later if tests start interfering.

### 4.4 Email and tokens (verify email, invitations)

Flows like **register → verify email** and **invite → accept invitation** require a verification or invitation token that is normally sent by email. With the API running in a container, the test runner (on the host) cannot read in-memory state from inside the container.

- **Option 1 – Test email adapter (recommended)**
  - Implement an in-memory **test email adapter** that:
    - Implements the same interface as the console/mailgun adapters.
    - Stores the last (or last N) “sent” emails (e.g. OTP payload, invitation link/token).
  - In E2E, set `EMAIL_PROVIDER=test` (or inject the adapter when using an app factory) so the app uses this adapter.
  - After `POST /api/auth/register`, read the verification token from the test adapter and call `POST /api/auth/verify-email` with it.
  - Similarly, after creating an invitation, read the invitation token from the test adapter and call accept-invitation.

- **Option 2 – Read token from DB**
  - After register, query the `user_authentication_methods` table (or the repository’s `findByToken` input source) to get the stored OTP token.
  - After invite, query the `organization_invitations` (or equivalent) table for the invitation token.
  - Use these in the next request.
  - Works with any email provider (e.g. `console`); no new adapter, but couples tests to DB schema and requires DB access in the test process.

With the **API in a container**, the test runner cannot read in-memory adapters inside the container. **Use DB to get tokens**: after register, query `user_authentication_methods` for the OTP token; after invite, query the invitations table. The test process needs `DB_URL` to the E2E Postgres; a small helper (e.g. `getLastVerificationTokenForEmail(email)`) keeps tests readable.

---

## 5. Implementation Plan (Phased)

### Phase 1 – API Dockerfile and deployment-ready image

- Add **API Dockerfile** (e.g. `infrastructure/docker/api.Dockerfile` or `apps/api/Dockerfile`) so the stack is deployment-ready: multi-stage build (deps, build, production image); monorepo root as context; default command `node dist/server.js`. This image is used **both for E2E** (in docker-compose.e2e.yml) **and for deployment** (staging/production).

### Phase 2 – Docker Compose E2E and test env

- Add **`docker-compose.e2e.yml`** with three services:
  - **postgres**: image `postgres:16-alpine`, DB `grant_e2e`, healthcheck; expose port (e.g. `5433`) so the host can run migrations and E2E tests can connect for token lookups.
  - **redis**: image `redis:7-alpine`, healthcheck; API connects via service name `redis`.
  - **api**: build from the API Dockerfile; `depends_on` postgres and redis with `condition: service_healthy`; env: `DB_URL=postgresql://...@postgres:5432/grant_e2e`, `REDIS_HOST=redis`, `CACHE_STRATEGY=redis`, `EMAIL_PROVIDER=console`, `NODE_ENV=test`, `JWT_SECRET=...`, `SECURITY_ENABLE_RATE_LIMIT=false` (or high limit); `ports: ["4000:4000"]`.
- Add **`.env.e2e.example`** (and optionally `.env.e2e` in gitignore) with:
  - `NODE_ENV=test`
  - `DB_URL=postgresql://grant_user:grant_password@localhost:5433/grant_e2e`
  - `REDIS_HOST=localhost` `REDIS_PORT=6380` (and `REDIS_PASSWORD` if set)
  - `CACHE_STRATEGY=redis`
  - `EMAIL_PROVIDER=console` (or `test` once adapter exists)
  - `SECURITY_ENABLE_RATE_LIMIT=false` or high limits to avoid 429s in tests (optional)
  - `JWT_SECRET=...` (fixed value for tests)
- Document in README or `docs/development/testing.md`: “Start E2E env: `docker compose -f docker-compose.e2e.yml up -d`; run migrations; then `pnpm test:e2e`.”

### Phase 3 – Migrations and E2E script

- **Migrations**: Run from the host **before** the API serves traffic. E2E script: start postgres + redis, wait for healthy, run `DB_URL=... pnpm db:migrate`, then start the API service and wait for `GET /health` → 200.
- **E2E setup**: Load `.env.e2e`; ensure `E2E_API_BASE_URL` is set; optionally wait in a loop for health with timeout.
- **DB helpers for tokens**: Small helpers (e.g. in `tests/e2e/helpers/db-tokens.ts`) that connect to E2E Postgres and return the latest verification token for an email and the latest invitation token; use after register and after invite in E2E.
- **Vitest config**: include `tests/e2e/**/*.e2e.test.ts`, longer timeout (e.g. 30s), sequential.

### (Optional) Test email adapter – not used for real-container E2E

When the API runs in Docker, tests get tokens from the DB (see Phase 3). If you ever run E2E in-process, you could add a **test email adapter** that implements the same interface as the console adapter but:

- Pushes each “sent” email (type, to, subject, and extracted token/link) into an in-memory array (or last-Otp/last-Invitation).
- Expose a way to get the last verification token and last invitation token (e.g. `getLastVerificationToken()`, `getLastInvitationToken()`).
- Wire it in the email factory when `EMAIL_PROVIDER=test` (or when `process.env.NODE_ENV === 'test'` and a flag is set).
- In E2E, after register, get token from adapter and call verify-email; after invite, get token and call accept-invitation.

### Phase 4 – E2E flows (one file or a few)

- **Single E2E file** (or one per domain) that runs the main flows **in order** (because they depend on each other):
  1. **Health** – `GET /health` → 200.
  2. **Register** – `POST /api/auth/register` (email + password) → 201, store `accessToken`/`refreshToken` (and optionally use test adapter to get verify token).
  3. **Verify email** – `POST /api/auth/verify-email` with token from email (test adapter or DB).
  4. **Login** – `POST /api/auth/login` (same email/password) → 200, store tokens.
  5. **Create secondary account** – `POST /api/me/accounts` with Bearer token → 201.
  6. **Exchange token** – Create API key (e.g. via `POST /api/api-keys` or the appropriate endpoint), then `POST /api/auth/token` with clientId/secret → 200, get JWT.
  7. **Create organization** – `POST /api/organizations` with body (name, etc.) and scope/context → 201.
  8. **Invite member** – `POST /api/organization-invitations` (or equivalent) with org scope → 201; get invitation token from test adapter (or DB).
  9. **Accept invitation** – `POST /api/organization-invitations/:token/accept` (or the exact route) with token and invitee user data → 200/201.
  10. **Create project** – `POST /api/projects` under the organization (with org scope) → 201.

- Use **supertest** with **base URL**: `request(process.env.E2E_API_BASE_URL).post('/api/auth/register').send(...).expect(201)`.
- Get verification and invitation tokens via **DB helpers** (Phase 3); use **unique identifiers** per run (e.g. `e2e-${Date.now()}@test.grant.dev`).
- Assert status codes and response shape (e.g. `body.data.accessToken` present).

### Phase 5 – CI and scripts

- **Script** `scripts/e2e.sh`: (1) `docker compose -f docker-compose.e2e.yml up -d postgres redis`; (2) wait for Postgres/Redis healthy; (3) `DB_URL=... pnpm db:migrate`; (4) `docker compose -f docker-compose.e2e.yml up -d api`; (5) wait for `GET http://localhost:4000/health` → 200; (6) set `E2E_API_BASE_URL=http://localhost:4000` and `DB_URL`, run `pnpm test:e2e`; (7) optionally `docker compose -f docker-compose.e2e.yml down`.
- **GitHub Action**: job with Docker; run the script; optionally build API image once and reuse.

---

## 6. File and Script Summary

| Item                                                             | Purpose                                                                                        |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **API Dockerfile** (e.g. `infrastructure/docker/api.Dockerfile`) | Build API image for E2E and deployment; same image for both.                                   |
| `docker-compose.e2e.yml`                                         | Postgres + Redis + **api** (built from Dockerfile); ports for host access.                     |
| `.env.e2e.example`                                               | Example env for E2E (DB*URL, REDIS*\*, CACHE_STRATEGY, etc.).                                  |
| `apps/api/tests/e2e/setup.ts`                                    | Load `.env.e2e`, ensure `E2E_API_BASE_URL` set, optional health wait.                          |
| `apps/api/tests/e2e/helpers/db-tokens.ts`                        | Helpers to get verification/invitation tokens from E2E Postgres.                               |
| `apps/api/tests/e2e/flows.e2e.test.ts`                           | Main E2E flows using base URL and DB helpers.                                                  |
| `scripts/e2e.sh`                                                 | Start postgres+redis, migrate, start api, wait for health, run test:e2e, optionally tear down. |
| `docs/development/testing.md`                                    | Add “E2E testing” section: docker-compose, env, and `pnpm test:e2e`.                           |

---

## 7. Best Tools for This Stack (Recap)

- **Vitest** – test runner on host/CI.
- **supertest** with **base URL** – HTTP assertions against the real API container (e.g. `http://localhost:4000`).
- **Docker Compose (e2e)** – Postgres, Redis, and **API** (built from deployment Dockerfile).
- **Single API Dockerfile** – same image for E2E and for deployment; stack is deployment-ready.
- **Migrations from host** – run before API serves traffic; then start API container and wait for health.
- **DB helpers** – tests read verification/invitation tokens from E2E Postgres (API runs in container, so no in-process adapter).

This gives true end-to-end coverage: the same image and runtime you deploy, verified by tests that hit the API over the network.
