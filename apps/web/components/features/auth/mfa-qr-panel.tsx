'use client';

import { useEffect, useState } from 'react';

import QRCode from 'qrcode';
import { Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

interface MfaQrPanelProps {
  secret: string;
  otpAuthUrl: string;
}

export function MfaQrPanel({ secret, otpAuthUrl }: MfaQrPanelProps) {
  const t = useTranslations('settings.security.mfa.qr');
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(otpAuthUrl, {
      width: 180,
      margin: 1,
      errorCorrectionLevel: 'M',
    })
      .then((url: string) => {
        if (!cancelled) {
          setDataUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [otpAuthUrl]);

  return (
    <div className="space-y-5 py-1">
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={t('imageAlt')}
          width={180}
          height={180}
          className="mx-auto rounded border"
        />
      ) : (
        <div
          className="mx-auto h-[180px] w-[180px] animate-pulse rounded border bg-muted"
          aria-hidden
        />
      )}
      <div className="rounded border p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t('secretLabel')}</p>
            <p className="break-all text-sm font-mono">{secret}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('copySecret')}
            onClick={async () => {
              await navigator.clipboard.writeText(secret);
              toast.success(t('copied'));
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
