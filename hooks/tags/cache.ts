import { ApolloCache } from '@apollo/client';

export function evictTagsCache(cache: ApolloCache<any>) {
  // Invalidate all tag queries to force a refetch
  cache.evict({ fieldName: 'tags' });
}
