import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { EntityCache } from '@/graphql/lib/scopeFiltering';
import { Services } from '@/graphql/services';

import { ProjectController } from './controller';

export function createProjectController(
  scopeCache: EntityCache,
  services: Services,
  db: PostgresJsDatabase
) {
  return new ProjectController(scopeCache, services, db);
}
