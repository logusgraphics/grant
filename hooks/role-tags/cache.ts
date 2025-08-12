import { ApolloCache } from '@apollo/client';

export function evictRoleTagsCache(cache: ApolloCache<any>) {
  cache.evict({ fieldName: 'roleTags' });
  cache.gc();
}
