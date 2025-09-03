import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { EntityCache } from '@/graphql/lib/scopeFiltering';
import { Services } from '@/graphql/services';

import { RoleController } from './controller';

export function createRoleController(
  scopeCache: EntityCache,
  services: Services,
  db: PostgresJsDatabase
) {
  return new RoleController(scopeCache, services, db);
}
