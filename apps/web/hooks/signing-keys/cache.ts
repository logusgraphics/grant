import { ApolloCache } from '@apollo/client';

export function evictSigningKeysCache(cache: ApolloCache) {
  cache.evict({
    fieldName: 'signingKeys',
  });
  cache.gc();
}
