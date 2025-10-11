import { EntityCache } from '@/handlers/base/scope-handler';

export function createScopeCache(): EntityCache {
  return {
    roles: new Map(),
    users: new Map(),
    groups: new Map(),
    permissions: new Map(),
    tags: new Map(),
    projects: new Map(),
  };
}
