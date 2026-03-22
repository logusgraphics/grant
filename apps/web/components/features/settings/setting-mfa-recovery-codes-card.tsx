'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useMfaRecoveryCodeStatus, useRecoveryCodes } from '@/hooks/mfa';

import { SettingCard } from './setting-card';

interface SettingMfaRecoveryCodesCardProps {
  factorId?: string;
}

export function SettingMfaRecoveryCodesCard({ factorId }: SettingMfaRecoveryCodesCardProps) {
  const t = useTranslations('settings.security.mfa');
  const { generateCodes } = useRecoveryCodes();
  const {
    data: statusData,
    loading: statusQueryLoading,
    refetch: refetchStatus,
  } = useMfaRecoveryCodeStatus();
  const [codes, setCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const status = statusData?.myMfaRecoveryCodeStatus;
  const activeCount = status?.activeCount ?? 0;
  const lastGeneratedAt = status?.lastGeneratedAt
    ? new Date(status.lastGeneratedAt).toLocaleString()
    : undefined;

  const hasStoredCodes = activeCount > 0;
  const showRegenerateLabel = codes.length > 0 || hasStoredCodes;
  const statusPending = statusQueryLoading && !statusData;

  return (
    <SettingCard
      title={t('recovery.title')}
      description={t('recovery.description')}
      headerActions={
        <Button
          variant="outline"
          onClick={async () => {
            setLoading(true);
            try {
              const nextCodes = await generateCodes(factorId);
              setCodes(nextCodes);
              await refetchStatus();
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          {showRegenerateLabel ? t('recovery.regenerate') : t('recovery.generate')}
        </Button>
      }
    >
      {statusPending && !codes.length ? (
        <p className="text-sm text-muted-foreground">{t('recovery.statusLoading')}</p>
      ) : codes.length ? (
        <div className="space-y-3">
          <Alert variant="warning">
            <AlertTriangle />
            <AlertTitle>{t('recovery.oneTimeTitle')}</AlertTitle>
            <AlertDescription>{t('recovery.oneTimeDescription')}</AlertDescription>
          </Alert>
          <div className="grid grid-cols-2 gap-2">
            {codes.map((code) => (
              <div key={code} className="rounded border p-2 font-mono text-sm">
                {code}
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(codes.join('\n'));
              toast.success(t('recovery.copied'));
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            {t('recovery.copyAll')}
          </Button>
        </div>
      ) : hasStoredCodes ? (
        <p className="text-sm text-muted-foreground">
          {t('recovery.metadataActive', {
            count: activeCount,
            date: lastGeneratedAt ?? t('recovery.unknownDate'),
          })}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">{t('recovery.empty')}</p>
      )}
    </SettingCard>
  );
}
