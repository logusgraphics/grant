/**
 * One-shot database bootstrap for Kubernetes Helm hooks (post-install / post-upgrade).
 * Same migrate + seed path as server startup via bootstrapDatabase (advisory lock).
 *
 * loadEnv() must run before any module that reads process.env (e.g. @/config).
 */
import { loadEnv } from '@grantjs/env';

loadEnv();

async function main(): Promise<void> {
  const { validateConfig, config } = await import('@/config');
  const { bootstrapDatabase, closeDatabase, initializeDBConnection } =
    await import('@grantjs/database');
  const { loggerFactory } = await import('@/lib/logger');

  validateConfig();
  const db = initializeDBConnection({
    connectionString: config.db.url,
    max: config.db.poolMax,
    idleTimeout: config.db.idleTimeout,
    connectTimeout: config.db.connectionTimeout,
    logger: loggerFactory.createLogger('BootstrapJob'),
  });
  try {
    await bootstrapDatabase(db, config.system.systemUserId);
  } finally {
    await closeDatabase();
  }
}

void main().catch(async (err: unknown) => {
  try {
    const { createLogger } = await import('@/lib/logger');
    createLogger('bootstrap-job').error({ err }, 'Bootstrap job failed');
  } catch {
    // ignore logger init failure
  }
  process.exit(1);
});
