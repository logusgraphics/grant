'use client';

import { useTranslations } from 'next-intl';
import { Scope } from '@grantjs/schema';
import { KeyRound, RotateCw } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface SigningKeyRotateDialogProps {
  scope: Scope;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (scope: Scope) => Promise<void>;
  loading?: boolean;
  /** When true, use "Create signing key" copy and icon instead of "Rotate". */
  isCreate?: boolean;
}

export function SigningKeyRotateDialog({
  scope,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  isCreate = false,
}: SigningKeyRotateDialogProps) {
  const t = useTranslations('signingKeys.rotateDialog');

  const handleConfirm = async () => {
    try {
      await onConfirm(scope);
      onOpenChange(false);
    } catch {
      // Error is handled by mutation toast
    }
  };

  const Icon = isCreate ? KeyRound : RotateCw;
  const title = isCreate ? t('createTitle') : t('title');
  const description = isCreate ? t('createDescription') : t('description');
  const confirmLabel = isCreate ? t('createConfirm') : t('confirm');
  const confirmingLabel = isCreate ? t('createConfirming') : t('confirming');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={loading}>
            {loading ? (
              <>
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                {confirmingLabel}
              </>
            ) : (
              <>
                <Icon className="mr-2 h-4 w-4" />
                {confirmLabel}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
