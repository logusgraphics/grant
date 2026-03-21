'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Check, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  approveProjectConsent,
  denyProjectConsent,
  getProjectConsentInfo,
  type ProjectConsentInfo,
} from '@/lib/project-oauth-api';

export default function ProjectOAuthConsentPage() {
  const t = useTranslations('auth.projectOAuth.consent');
  const searchParams = useSearchParams();
  const consentToken = searchParams.get('consent_token');

  const [info, setInfo] = useState<ProjectConsentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'allow' | 'deny' | null>(null);

  useEffect(() => {
    if (!consentToken) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
    });
    getProjectConsentInfo(consentToken)
      .then((data) => {
        if (!cancelled) setInfo(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : t('failedToLoad'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [consentToken, t]);

  const hasMissingToken = !consentToken;
  const displayError = hasMissingToken ? t('missingToken') : error;
  const displayLoading = !hasMissingToken && loading;

  const handleAllow = useCallback(async () => {
    if (!consentToken) return;
    setActionLoading('allow');
    try {
      const { redirectUrl } = await approveProjectConsent(consentToken);
      // replace() keeps this window (popup) as the target so relay page sees window.opener
      window.location.replace(redirectUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('approveFailed'));
      setActionLoading(null);
    }
  }, [consentToken, t]);

  const handleDeny = useCallback(async () => {
    if (!consentToken) return;
    setActionLoading('deny');
    try {
      const { redirectUrl } = await denyProjectConsent(consentToken);
      window.location.replace(redirectUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('denyFailed'));
      setActionLoading(null);
    }
  }, [consentToken, t]);

  if (displayLoading) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (displayError && !info) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-destructive">{displayError}</p>
      </div>
    );
  }

  if (!info) return null;

  const appName = info.name ?? t('thisApp');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t('wantsAccess', { appName })}</h1>
        <p className="text-muted-foreground">{t('reviewPermissions')}</p>
      </div>

      {info.user && (
        <div className="rounded-xl border border-border/80 bg-muted/20 px-4 py-3 backdrop-blur-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('signedInAs')}
          </p>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
              {info.user.pictureUrl ? <AvatarImage src={info.user.pictureUrl} alt="" /> : null}
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {info.user.displayName?.trim() ? (
                  info.user.displayName.slice(0, 2).toUpperCase()
                ) : (
                  <User className="h-5 w-5" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">
                {info.user.displayName || info.user.email || '—'}
              </p>
              {info.user.email && (
                <p className="truncate text-sm text-muted-foreground">{info.user.email}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {info.scopes?.length ? (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">{t('permissions')}</p>
          <ul className="text-sm text-muted-foreground space-y-2 list-none pl-0">
            {info.scopes.map((s) => (
              <li key={s.slug} className="flex items-start gap-2">
                <Check className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" aria-hidden />
                <span>
                  <span className="font-medium text-foreground">{s.name}</span>
                  {s.description && <> — {s.description}</>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleAllow} disabled={!!actionLoading} className="flex-1">
          {actionLoading === 'allow' ? t('redirecting') : t('allow')}
        </Button>
        <Button
          variant="outline"
          onClick={handleDeny}
          disabled={!!actionLoading}
          className="flex-1"
        >
          {actionLoading === 'deny' ? t('redirecting') : t('deny')}
        </Button>
      </div>
    </div>
  );
}
