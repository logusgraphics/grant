import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { createProjectController } from '@/graphql/controllers/projects';
import { Services } from '@/graphql/services';

import { EntityCache } from '../lib/scopeFiltering';

export type Controllers = ReturnType<typeof createControllers>;

export function createControllers(
  scopeCache: EntityCache,
  services: Services,
  db: PostgresJsDatabase
) {
  return {
    projects: createProjectController(scopeCache, services, db),
  };
}
