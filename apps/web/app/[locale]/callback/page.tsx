'use client';

import { useEffect, useMemo, useRef } from 'react';

import { useSearchParams } from 'next/navigation';

import { useLocale } from 'next-intl';

import { FullPageLoader } from '@/components/common';
import { getApiBaseUrl } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';

export interface CallbackExchangePayload {
  accessToken: string;
  refreshToken: string;
  nextUrl?: string;
}

function parseCallbackExchangeResponse(
  raw: { success?: boolean; data?: CallbackExchangePayload } | CallbackExchangePayload
): CallbackExchangePayload | null {
  const data = 'data' in raw && raw.data ? raw.data : (raw as CallbackExchangePayload);
  if (data.accessToken && data.refreshToken) return data;
  return null;
}

function redirectToLoginWithError(locale: string): void {
  window.location.href = `/${locale}/auth/login?error=callback`;
}

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { setTokens, accessToken, refreshToken } = useAuthStore();
  const didRunRef = useRef(false);
  const nextUrl = useRef<string | null>(null);

  const isAuthenticated = useMemo(() => {
    return accessToken && refreshToken;
  }, [accessToken, refreshToken]);

  useEffect(() => {
    if (isAuthenticated) {
      const destination = nextUrl.current ? nextUrl.current : `/${locale}/dashboard`;
      window.location.href = destination;
    }
  }, [isAuthenticated, locale]);

  useEffect(() => {
    // Prevent double run under React Strict Mode (one-time code is single-use)
    if (didRunRef.current) return;
    didRunRef.current = true;

    const code = searchParams.get('code');

    if (code) {
      const apiBase = getApiBaseUrl();
      const exchangeUrl = `${apiBase}/api/auth/callback/exchange`;

      fetch(exchangeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((body) => {
              return Promise.reject(body);
            });
          }
          return res.json();
        })
        .then((raw: unknown) => {
          const data = parseCallbackExchangeResponse(
            raw as Parameters<typeof parseCallbackExchangeResponse>[0]
          );
          if (!data) {
            redirectToLoginWithError(locale);
            return;
          }
          nextUrl.current = data?.nextUrl ?? null;
          setTokens(data.accessToken, data.refreshToken);
        })
        .catch(() => {
          redirectToLoginWithError(locale);
        });
      return;
    }

    redirectToLoginWithError(locale);
  }, [locale, searchParams, setTokens]);

  return <FullPageLoader />;
}
