#!/usr/bin/env tsx
/**
 * Grants SECURITY_RLS_ROLE membership to the database login user (from DB_URL or POSTGRES_*).
 * Required for scoped API requests that run SET LOCAL ROLE (see context middleware + rls-context).
 */
import { ensureRlsRestrictedRoleMembership } from '../grant-rls-login-role.lib';

async function main(): Promise<void> {
  await ensureRlsRestrictedRoleMembership({ logSuccess: true });
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
