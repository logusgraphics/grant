/**
 * Grants SECURITY_RLS_ROLE membership to the database login user (from DB_URL or POSTGRES_*).
 * Shared by CLI (`db:grant-rls-role`) and {@link bootstrapDatabase}.
 */
import type { Env } from '@grantjs/env';
import { getDatabaseLoginUser, getEnv, resolveDatabaseUrl } from '@grantjs/env';
import postgres from 'postgres';

function resolveGrantRoleConnectionUrl(env: Env): string {
  const elevated = env.DB_GRANT_ROLE_URL?.trim();
  if (elevated) return elevated;
  return resolveDatabaseUrl(env);
}

/** Same rules as apps/api PG identifier validation for SECURITY_RLS_ROLE. */
const PG_IDENTIFIER_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function assertPgIdentifier(name: string, setting: string): string {
  if (name.length === 0 || name.length > 63 || !PG_IDENTIFIER_RE.test(name)) {
    throw new Error(
      `${setting} must be a valid PostgreSQL identifier (1–63 characters; [a-zA-Z_][a-zA-Z0-9_]*)`
    );
  }
  return name;
}

export type EnsureRlsRestrictedRoleMembershipOptions = {
  /** Defaults to {@link getEnv}; inject in tests. */
  env?: Env;
  /** When true, log success to stdout (CLI). Bootstrap leaves this false. */
  logSuccess?: boolean;
};

/**
 * Idempotent: PostgreSQL allows repeated GRANT of the same role membership.
 * When `DB_GRANT_ROLE_URL` is set (see `@grantjs/env`), connects with that URL so a superuser can GRANT when the app role cannot.
 */
export async function ensureRlsRestrictedRoleMembership(
  options: EnsureRlsRestrictedRoleMembershipOptions = {}
): Promise<void> {
  const env = options.env ?? getEnv();
  const restrictedRole = assertPgIdentifier(
    env.SECURITY_RLS_ROLE || 'grant_app_restricted',
    'SECURITY_RLS_ROLE'
  );
  const loginUser = assertPgIdentifier(getDatabaseLoginUser(env), 'database login user');

  const connectionString = resolveGrantRoleConnectionUrl(env);
  const client = postgres(connectionString, { max: 1 });
  try {
    const qRole = restrictedRole.replace(/"/g, '""');
    const qLogin = loginUser.replace(/"/g, '""');
    await client.unsafe(`GRANT "${qRole}" TO "${qLogin}"`);
    if (options.logSuccess) {
      console.log(`[grant-rls-login-role] Granted role "${restrictedRole}" to "${loginUser}".`);
    }
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code?: string }).code)
        : '';
    const msg = err instanceof Error ? err.message : String(err);
    if (code === '42501' || /permission denied/i.test(msg)) {
      console.error(
        `[grant-rls-login-role] Cannot GRANT role "${restrictedRole}" to "${loginUser}" with the current DB user.\n` +
          `Connect as a superuser or role with GRANT privilege (set DB_GRANT_ROLE_URL), or run manually:\n` +
          `  GRANT "${restrictedRole.replace(/"/g, '""')}" TO "${loginUser.replace(/"/g, '""')}";`
      );
    }
    throw err;
  } finally {
    await client.end({ timeout: 5 });
  }
}
