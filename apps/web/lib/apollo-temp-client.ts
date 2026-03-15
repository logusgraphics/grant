import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export function getTempClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: '/graphql',
      credentials: 'include',
    }),
  });
}
