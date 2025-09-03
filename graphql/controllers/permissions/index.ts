import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { EntityCache } from '@/graphql/lib/scopeFiltering';
import { Services } from '@/graphql/services';

import { PermissionController } from './controller';

export function createPermissionController(
  scopeCache: EntityCache,
  services: Services,
  db: PostgresJsDatabase
) {
  return new PermissionController(scopeCache, services, db);
}
