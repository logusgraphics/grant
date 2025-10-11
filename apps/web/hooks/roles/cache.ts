import { ApolloCache } from '@apollo/client';

export function evictRolesCache(cache: ApolloCache) {
  cache.evict({ fieldName: 'roles' });
  cache.gc();
}
