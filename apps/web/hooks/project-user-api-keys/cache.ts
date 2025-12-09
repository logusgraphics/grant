import { ApolloCache } from '@apollo/client';

export function evictProjectUserApiKeysCache(cache: ApolloCache) {
  cache.evict({
    fieldName: 'projectUserApiKeys',
  });
  cache.gc();
}
