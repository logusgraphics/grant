import { ApolloCache } from '@apollo/client';

export function evictAccountsCache(cache: ApolloCache) {
  cache.evict({ fieldName: 'accounts' });
  cache.gc();
}
