'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Relay page for project OAuth popup flow.
 * When the app's redirect_uri points here, we read access_token (and optional state/error)
 * from the URL fragment and postMessage to window.opener, then close.
 * Used by @grantjs/client signInWithProjectApp({ display: 'popup' }).
 */
export default function ProjectOAuthRelayPage() {
  const t = useTranslations('auth.projectOAuth.relay');
  const [status, setStatus] = useState<'reading' | 'sent' | 'no_opener' | 'error'>('reading');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash?.slice(1) || '';
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const error = params.get('error');
    const state = params.get('state');
    const expiresIn = params.get('expires_in');

    if (!window.opener) {
      queueMicrotask(() => {
        setStatus('no_opener');
        setMessage(t('noOpener'));
      });
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        type: 'grant-project-oauth',
        ...(error && { error, error_description: params.get('error_description') }),
        ...(accessToken && {
          access_token: accessToken,
          expires_in: expiresIn ? parseInt(expiresIn, 10) : undefined,
          token_type: params.get('token_type') || 'Bearer',
        }),
        ...(state && { state }),
      };
      window.opener.postMessage(payload, '*');
      queueMicrotask(() => {
        setStatus('sent');
        setMessage(t('complete'));
      });
      window.close();
    } catch (e) {
      queueMicrotask(() => {
        setStatus('error');
        setMessage(e instanceof Error ? e.message : t('error'));
      });
    }
  }, [t]);

  return (
    <div className="flex min-h-[200px] items-center justify-center p-6">
      <div className="text-center space-y-2">
        {status === 'reading' && <p className="text-muted-foreground">{t('completing')}</p>}
        {(status === 'sent' || status === 'no_opener') && (
          <>
            <p className="text-muted-foreground">{message}</p>
            {status === 'no_opener' && (
              <p className="text-sm text-muted-foreground">{t('closeTab')}</p>
            )}
          </>
        )}
        {status === 'error' && <p className="text-destructive">{message}</p>}
      </div>
    </div>
  );
}
