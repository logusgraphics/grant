import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

import { getApiBaseUrl } from '@/lib/constants';

export function getTempClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: `${getApiBaseUrl()}/graphql`,
      credentials: 'include',
    }),
  });
}
