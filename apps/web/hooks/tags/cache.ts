import { ApolloCache } from '@apollo/client';

export function evictTagsCache(cache: ApolloCache) {
  cache.evict({ fieldName: 'tags' });
  cache.gc();
}
