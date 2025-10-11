'use client';

import { useEffect, useState } from 'react';

import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';

import { getClient } from '@/lib/apollo-client';

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<ReturnType<typeof getClient>>();

  useEffect(() => {
    setClient(getClient());
  }, []);

  if (!client) {
    return null;
  }

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}
