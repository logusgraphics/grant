/**
 * @grantjs/env – Typed environment contract for Grant platform.
 *
 * Loads the standard env file hierarchy from monorepo root (.env, .env.local,
 * .env.{NODE_ENV}, .env.{NODE_ENV}.local) on first import. Uses lazy parsing so
 * test/E2E can mutate process.env before first getEnv() call. Call resetEnv() in
 * tests after mutating env to force re-parse.
 */

import { loadEnv as loadEnvImpl } from './load-env';
import { envSchema, type Env } from './schema';

if (!process.env.__GRANT_ENV_LOADED) {
  loadEnvImpl();
  process.env.__GRANT_ENV_LOADED = 'true';
}

let cachedEnv: Env | null = null;

/**
 * Returns parsed and validated env. Parses on first call and caches (frozen).
 */
export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = Object.freeze(envSchema.parse(process.env)) as Env;
  }
  return cachedEnv;
}

/**
 * Clear cached env so the next getEnv() re-parses process.env.
 * Use in tests after mutating process.env to pick up overrides.
 */
export function resetEnv(): void {
  cachedEnv = null;
}

/**
 * Build database URL from env. Uses DB_URL if set, otherwise builds from POSTGRES_*.
 */
export function resolveDatabaseUrl(env: Env): string {
  if (env.DB_URL) return env.DB_URL;
  return `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`;
}

export type { Env };
export { envSchema };
export { findWorkspaceRoot, loadEnv } from './load-env';
