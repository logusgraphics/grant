'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { VerifyMfaDocument, VerifyMfaRecoveryCodeDocument } from '@grantjs/schema';
import { Info, ShieldCheck } from 'lucide-react';

import { MfaOtpInput } from '@/components/features/auth/mfa-otp-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from '@/i18n/navigation';
import { getTempClient } from '@/lib/apollo-temp-client';
import { useAuthStore } from '@/stores/auth.store';
import { useMfaStepUpStore } from '@/stores/mfa-step-up.store';

export function MfaStepUpDialog() {
  const t = useTranslations('auth.mfaStepUp');
  const router = useRouter();
  const { isOpen, hasActiveEnrollment, complete, cancel } = useMfaStepUpStore();
  const { setAccessToken, setMfaVerified } = useAuthStore();

  const [code, setCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const resetState = useCallback(() => {
    setCode('');
    setRecoveryCode('');
    setShowRecoveryForm(false);
    setError(null);
    setVerifying(false);
  }, []);

  useEffect(() => {
    if (isOpen) resetState();
  }, [isOpen, resetState]);

  const authHeaders = () => {
    const token = useAuthStore.getState().accessToken;
    return token ? { authorization: `Bearer ${token}` } : {};
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setVerifying(true);
    try {
      const result = await getTempClient().mutate({
        mutation: VerifyMfaDocument,
        variables: { input: { code } },
        context: { headers: authHeaders() },
      });
      const accessToken = result.data?.verifyMfa?.accessToken;
      if (accessToken) {
        setAccessToken(accessToken);
        setMfaVerified(true);
        complete();
      } else {
        setError(t('invalidCode'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('invalidCode'));
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyRecoveryCode = async () => {
    setError(null);
    setVerifying(true);
    try {
      const result = await getTempClient().mutate({
        mutation: VerifyMfaRecoveryCodeDocument,
        variables: { input: { code: recoveryCode } },
        context: { headers: authHeaders() },
      });
      const data = result.data?.verifyMfaRecoveryCode;
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        setMfaVerified(true);
        complete();
      } else {
        setError(t('invalidRecoveryCode'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('invalidRecoveryCode'));
    } finally {
      setVerifying(false);
    }
  };

  const handleCancel = () => {
    resetState();
    cancel();
  };

  const handleGoToSettings = () => {
    resetState();
    cancel();
    router.push('/dashboard/settings/security');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent
        hideCloseButton
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary size-5" />
            <DialogTitle>{t('title')}</DialogTitle>
          </div>
          <DialogDescription>
            {hasActiveEnrollment ? t('description') : t('noEnrollment.description')}
          </DialogDescription>
        </DialogHeader>

        {!hasActiveEnrollment ? (
          <div className="space-y-4">
            <Alert variant="info">
              <Info className="size-4" />
              <AlertTitle>{t('noEnrollment.alertTitle')}</AlertTitle>
              <AlertDescription>{t('noEnrollment.alertDescription')}</AlertDescription>
            </Alert>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {t('cancel')}
              </Button>
              <Button onClick={handleGoToSettings}>{t('noEnrollment.goToSettings')}</Button>
            </div>
          </div>
        ) : !showRecoveryForm ? (
          <form className="space-y-4" onSubmit={handleVerify}>
            <div className="space-y-2">
              <Label htmlFor="mfa-step-up-totp">{t('totpLabel')}</Label>
              <MfaOtpInput
                id="mfa-step-up-totp"
                value={code}
                onChange={setCode}
                disabled={verifying}
                containerClassName="justify-center"
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={verifying}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={verifying || code.length < 6}>
                {verifying ? t('verifying') : t('verify')}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {t('recoveryPrompt')}{' '}
              <button
                type="button"
                onClick={() => {
                  setShowRecoveryForm(true);
                  setError(null);
                }}
                className="text-primary hover:text-primary/80"
              >
                {t('recoveryLink')}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mfa-step-up-recovery">{t('recoveryCodeLabel')}</Label>
              <Input
                id="mfa-step-up-recovery"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                placeholder={t('recoveryCodePlaceholder')}
                disabled={verifying}
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={verifying}>
                {t('cancel')}
              </Button>
              <Button
                onClick={handleVerifyRecoveryCode}
                disabled={verifying || recoveryCode.trim().length < 8}
              >
                {verifying ? t('verifying') : t('verify')}
              </Button>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setShowRecoveryForm(false);
                  setRecoveryCode('');
                  setError(null);
                }}
                className="text-sm text-primary hover:text-primary/80"
              >
                {t('backToAuthenticator')}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
