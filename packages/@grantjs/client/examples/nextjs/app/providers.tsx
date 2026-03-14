'use client';

import { useMemo } from 'react';

import { GrantProvider, type GrantClientConfig } from '@grantjs/client/react';

import { getOAuthCallbackToken } from '@/lib/oauth-callback-token';
import { useOrigin } from '@/lib/use-origin';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const origin = useOrigin();
  const config = useMemo<GrantClientConfig>(
    () => ({
      apiUrl: '',
      frontendUrl: origin || 'http://localhost:3004',
      getAccessToken: () => {
        if (typeof window === 'undefined') return null;
        // In this example, the callback page sets the token from the OAuth redirect so useGrant/GrantGate can use it.
        // In production, return the token from your secure auth store (e.g. server session, httpOnly cookie).
        return getOAuthCallbackToken();
      },

      onUnauthorized: () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      cache: {
        ttl: 5 * 60 * 1000,
        prefix: 'grant',
      },
    }),
    [origin]
  );

  return <GrantProvider config={config}>{children}</GrantProvider>;
}
