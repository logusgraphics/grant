# Plan revisions: Typed env contract

Revisions to the main plan for the `@grantjs/env` and config migration.

**Pre-implementation checklist (final rules):**

1. **Env package does NOT load dotenv.** Applications load dotenv at entrypoints; libraries only read `process.env`. Keeps `@grantjs/env` a pure validation layer.
2. **Lazy parsing.** Export `getEnv(): Env` (parse on first call, cache). Do not use `export const env = envSchema.parse(process.env)` — avoids E2E/scripts/CLI timing issues.
3. **Minimal structure.** Start with `index.ts` + `schema.ts` only. No `server.ts` / `client.ts` until needed (web app uses `/api/config`; frontend env surface is tiny).

---

## 1. Dotenv loading: only in entrypoints (canonical rule)

**One rule for the monorepo.** Dotenv is loaded **only in application entrypoints**. The `@grantjs/env` package must **not** call `dotenv.config()` or mutate `process` state. Libraries should never mutate process state.

**Pattern:**

- **API server entry** (e.g. `apps/api/src/server.ts` or main bootstrap):

  ```ts
  import dotenv from 'dotenv';
  dotenv.config();

  import { getEnv } from '@grantjs/env';
  // ... rest of app
  ```

- **Database scripts** (e.g. drizzle.config, seed, reset-db):

  ```ts
  import dotenv from 'dotenv';
  dotenv.config();

  import { getEnv } from '@grantjs/env';
  ```

Remove from the plan any option where the env package calls `dotenv.config()` automatically. Callers are responsible for loading env before using the package.

---

## 2. Lazy parsing (no eager parse on import)

Do **not** use eager parsing:

```ts
// BAD: runs immediately on import; breaks test setups, scripts that modify env, E2E overrides
export const env = envSchema.parse(process.env);
```

Use **lazy parsing** with a cached getter:

```ts
let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env);
  }
  return cachedEnv;
}
```

**Usage:** `const env = getEnv()` at the start of config building (e.g. in API config module).

**Benefits:**

- Env mutations in test setup (e.g. E2E) work: setup sets `process.env` before any code calls `getEnv()`.
- Env is validated only once.
- Safer in monorepos where scripts or tests override env.

---

## 3. Package structure: start minimal

Start with two files only:

```
packages/@grantjs/env/
├── src/
│   ├── index.ts
│   └── schema.ts
```

Do **not** add `server.ts` or `client.ts` initially. Client env is barely used (web app gets runtime config from the API). Add a client subset later if needed.

---

## 4. Single helper for derived Postgres URL (API config)

Keep derivation explicit and in one place. In the API config layer (e.g. `apps/api/src/config/env.config.ts` or a small util next to it), define:

```ts
function resolveDatabaseUrl(env: Env): string {
  if (env.DB_URL) return env.DB_URL;
  return `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`;
}
```

Then in config:

```ts
database: {
  url: resolveDatabaseUrl(env),
  // ...
}
```

All other code uses `config.database.url`; no repeated Postgres URL logic.

---

## 5. E2E / test setup

With **lazy parsing** (section 2), E2E setup should set `process.env` (e.g. `E2E_API_BASE_URL`, `E2E_DB_URL`) **before** any code that might call `getEnv()` runs. No need for the env package to expose a separate “loadEnv” for tests; the same `getEnv()` is used everywhere, and the first call after setup sees the mutated environment.

---

## 6. Stage 4 ESLint: allow process.env in config, scripts, and tests

Do **not** ban `process.env` everywhere. Allow it in:

- `config/`
- `scripts/`
- `tests/`

Target the rule at application source under `apps/**/src/**` and **exclude**:

- `**/config/**`
- `**/scripts/**`
- `**/tests/**`

So only “normal” app code (handlers, services, middleware, etc.) must use `config` or `getEnv()`; config, scripts, and tests can keep using `process.env` or the loader without fighting the linter.
