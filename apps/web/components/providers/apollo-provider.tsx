'use client';

import { useMemo } from 'react';

import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { useTranslations } from 'next-intl';

import { getClient } from '@/lib/apollo-client';

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations('session');
  const client = useMemo(
    () =>
      getClient({
        getSessionExpiredMessages: () => ({
          title: t('expiredTitle'),
          description: t('expiredDescription'),
        }),
      }),
    [t]
  );

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}
