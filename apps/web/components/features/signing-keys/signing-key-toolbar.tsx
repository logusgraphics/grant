'use client';

import { useCallback, useState } from 'react';

import { useGrant } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';
import { Scope, Tenant } from '@grantjs/schema';
import { Plus, RotateCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { RefreshButton, Toolbar } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useScopeFromParams } from '@/hooks/common';
import { useSigningKeyMutations } from '@/hooks/signing-keys';
import { useUserStore } from '@/stores/user.store';

import { SigningKeyRotateDialog } from './signing-key-rotate-dialog';

/**
 * Toolbar for the signing keys page. Uses store for refetch/loading (set by SigningKeyViewer).
 * When no keys exist: "Create signing key" + Plus. When keys exist: "Rotate key" + RotateCw.
 * Dialog open state is in store so the empty-state action can open it.
 */
export function SigningKeyToolbar() {
  const t = useTranslations('signingKeys.toolbar');
  const scope = useScopeFromParams();
  const signingKeysRefetch = useUserStore((state) => state.signingKeysRefetch);
  const loading = useUserStore((state) => state.signingKeysLoading);
  const hasKeys = useUserStore((state) => state.signingKeysHasKeys);
  const rotateDialogOpen = useUserStore((state) => state.signingKeysRotateDialogOpen);
  const setRotateDialogOpen = useUserStore((state) => state.setSigningKeysRotateDialogOpen);

  const [rotating, setRotating] = useState(false);

  const { rotateSigningKey } = useSigningKeyMutations();

  const canQuery = useGrant(ResourceSlug.ApiKey, ResourceAction.Query, {
    scope: scope!,
  });
  const isProjectScope =
    scope?.tenant === Tenant.AccountProject || scope?.tenant === Tenant.OrganizationProject;

  const handleCreateOrRotateClick = useCallback(() => {
    setRotateDialogOpen(true);
  }, [setRotateDialogOpen]);

  const handleRotateConfirm = useCallback(
    async (s: Scope) => {
      setRotating(true);
      try {
        await rotateSigningKey(s);
        signingKeysRefetch?.();
      } finally {
        setRotating(false);
      }
    },
    [rotateSigningKey, signingKeysRefetch]
  );

  if (!scope || !canQuery || !isProjectScope) {
    return null;
  }

  const toolbarItems = [
    <RefreshButton key="refresh" onRefresh={signingKeysRefetch ?? undefined} loading={loading} />,
    hasKeys ? (
      <Button
        key="rotate"
        variant="outline"
        size="sm"
        onClick={handleCreateOrRotateClick}
        disabled={loading || rotating}
        aria-label={t('rotate')}
      >
        <RotateCw
          className={['mr-2 h-4 w-4', rotating && 'animate-spin'].filter(Boolean).join(' ')}
        />
        {t('rotate')}
      </Button>
    ) : (
      <Button
        key="create"
        variant="outline"
        size="sm"
        onClick={handleCreateOrRotateClick}
        disabled={loading || rotating}
        aria-label={t('create')}
      >
        <Plus className={['mr-2 h-4 w-4', rotating && 'animate-spin'].filter(Boolean).join(' ')} />
        {t('create')}
      </Button>
    ),
  ];

  return (
    <>
      <Toolbar items={toolbarItems} />
      <SigningKeyRotateDialog
        scope={scope}
        open={rotateDialogOpen}
        onOpenChange={setRotateDialogOpen}
        onConfirm={handleRotateConfirm}
        loading={rotating}
        isCreate={!hasKeys}
      />
    </>
  );
}
