import { ApolloCache } from '@apollo/client';

export function evictProjectsCache(cache: ApolloCache) {
  cache.evict({
    fieldName: 'projects',
  });
  cache.gc();
}
