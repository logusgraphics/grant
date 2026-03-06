import { ApolloCache } from '@apollo/client';

export function evictProjectAppsCache(cache: ApolloCache) {
  cache.evict({
    fieldName: 'projectApps',
  });
  cache.gc();
}
