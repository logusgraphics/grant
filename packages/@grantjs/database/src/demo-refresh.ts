import crypto from 'node:crypto';

import { and, eq } from 'drizzle-orm';
import { reset } from 'drizzle-seed';

import { signingKeys, users } from './schemas';
import { resetTables } from './scripts/reset-db';
import { seedAll } from './scripts/seed-permissions';

import type { DbSchema } from './connection';

const SYSTEM_SCOPE_TENANT = 'system';

async function ensureSystemUserAndSigningKey(db: DbSchema, systemUserId: string): Promise<void> {
  const existingSystemUser = await db
    .select()
    .from(users)
    .where(eq(users.id, systemUserId))
    .limit(1);

  if (existingSystemUser.length === 0) {
    const now = new Date();
    await db.insert(users).values({
      id: systemUserId,
      name: 'System',
      pictureUrl: null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  const existingKey = await db
    .select()
    .from(signingKeys)
    .where(
      and(
        eq(signingKeys.scopeTenant, SYSTEM_SCOPE_TENANT),
        eq(signingKeys.scopeId, systemUserId),
        eq(signingKeys.active, true)
      )
    )
    .limit(1);

  if (existingKey.length === 0) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const kid = `system-${crypto.randomUUID()}`;
    await db.insert(signingKeys).values({
      scopeTenant: SYSTEM_SCOPE_TENANT,
      scopeId: systemUserId,
      kid,
      publicKeyPem: publicKey,
      privateKeyPem: privateKey,
      algorithm: 'RS256',
      active: true,
    });
  }
}

/**
 * Reset the database to an empty state and reseed core system data for demo environments.
 *
 * - Uses the same table set as the CLI reset script.
 * - Ensures the system user and signing key exist.
 * - Reseeds the permission model.
 */
export async function runDemoRefresh(db: DbSchema, systemUserId: string): Promise<void> {
  await reset(db, resetTables);
  await ensureSystemUserAndSigningKey(db, systemUserId);
  await seedAll(db);
}
