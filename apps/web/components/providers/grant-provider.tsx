'use client';

import { ReactNode, useMemo } from 'react';

import { GrantProvider as GrantProviderBase, type GrantClientConfig } from '@grantjs/client/react';

import { logoutSession } from '@/lib/apollo-client';
import { getApiBaseUrl } from '@/lib/constants';
import { refreshSessionViaCookie } from '@/lib/refresh-session';
import { useAuthStore } from '@/stores/auth.store';

interface GrantProviderProps {
  children: ReactNode;
}

/**
 * Grant authorization provider that integrates with the auth store
 * for token management and automatic refresh.
 */
export function GrantProvider({ children }: GrantProviderProps) {
  const config = useMemo<GrantClientConfig>(
    () => ({
      apiUrl: getApiBaseUrl(),

      // Token getters - read from auth store (refresh token is HttpOnly cookie, not in JS)
      getAccessToken: () => useAuthStore.getState().accessToken,
      getRefreshToken: () => null,

      // Handle token refresh - update auth store with new access token only
      onTokenRefresh: (tokens) => {
        useAuthStore.getState().setAccessToken(tokens.accessToken);
      },

      // Handle unauthorized - clear server session and client auth; SessionRestoreGate will redirect to login
      onUnauthorized: async () => {
        await logoutSession();
        useAuthStore.getState().clearAuth();
      },

      // Cookie-only refresh on 401; uses shared refresh so Apollo + Grant trigger a single refresh
      onRefreshWithCredentials: () => refreshSessionViaCookie(),

      // Cache configuration
      cache: {
        ttl: 5 * 60 * 1000, // 5 minutes
        prefix: 'grant',
      },
    }),
    []
  );

  return <GrantProviderBase config={config}>{children}</GrantProviderBase>;
}
