import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { createProjectController } from '@/graphql/controllers/projects';
import { Services } from '@/graphql/services';

import { EntityCache } from '../lib/scopeFiltering';

import { createGroupController } from './groups';
import { createOrganizationController } from './organizations';
import { createPermissionController } from './permissions';
import { createTagController } from './tags';
import { createUserController } from './users';

export type Controllers = ReturnType<typeof createControllers>;

export function createControllers(
  scopeCache: EntityCache,
  services: Services,
  db: PostgresJsDatabase
) {
  return {
    projects: createProjectController(scopeCache, services, db),
    users: createUserController(scopeCache, services, db),
    groups: createGroupController(scopeCache, services, db),
    permissions: createPermissionController(scopeCache, services, db),
    tags: createTagController(scopeCache, services, db),
    organizations: createOrganizationController(scopeCache, services, db),
  };
}
