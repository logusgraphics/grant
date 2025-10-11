import { ApolloCache } from '@apollo/client';

export function evictUsersCache(cache: ApolloCache) {
  cache.evict({ fieldName: 'users' });
  cache.gc();
}
