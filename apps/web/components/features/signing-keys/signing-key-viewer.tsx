'use client';

import { useCallback, useEffect } from 'react';

import { useGrant } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';
import { GetSigningKeysQuery, Scope, Tenant } from '@grantjs/schema';
import { format } from 'date-fns';
import { Fingerprint } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Avatar,
  CopyToClipboard,
  DataTable,
  type DataTableColumnConfig,
  type TableSkeletonColumnConfig,
} from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useScopeFromParams } from '@/hooks/common';
import { useSigningKeys } from '@/hooks/signing-keys';
import { useUserStore } from '@/stores/user.store';

type SigningKeyRow = GetSigningKeysQuery['signingKeys'][number];

export interface SigningKeyViewerProps {
  /** When not provided, scope is derived from URL params. */
  scope?: Scope | null;
}

/**
 * Viewer for signing keys. Uses useSigningKeys, syncs refetch/loading to store for the toolbar.
 * Renders the keys table (and error state). Only for project scopes (AccountProject, OrganizationProject).
 */
export function SigningKeyViewer({ scope: scopeProp }: SigningKeyViewerProps) {
  const scopeFromParams = useScopeFromParams();
  const scope = scopeProp ?? scopeFromParams;

  const t = useTranslations('signingKeys.viewer');
  const setSigningKeysRefetch = useUserStore((state) => state.setSigningKeysRefetch);
  const setSigningKeysLoading = useUserStore((state) => state.setSigningKeysLoading);
  const setSigningKeysHasKeys = useUserStore((state) => state.setSigningKeysHasKeys);
  const setSigningKeysRotateDialogOpen = useUserStore(
    (state) => state.setSigningKeysRotateDialogOpen
  );

  const { signingKeys, loading, error, refetch } = useSigningKeys({ scope: scope! });

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    setSigningKeysRefetch(handleRefetch);
    return () => setSigningKeysRefetch(null);
  }, [handleRefetch, setSigningKeysRefetch]);

  useEffect(() => {
    setSigningKeysLoading(loading);
  }, [loading, setSigningKeysLoading]);

  useEffect(() => {
    setSigningKeysHasKeys(signingKeys.length > 0);
  }, [signingKeys.length, setSigningKeysHasKeys]);

  const canQuery = useGrant(ResourceSlug.ApiKey, ResourceAction.Query, {
    scope: scope!,
  });
  const isProjectScope =
    scope?.tenant === Tenant.AccountProject || scope?.tenant === Tenant.OrganizationProject;

  if (!scope || !canQuery || !isProjectScope) {
    return null;
  }

  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return t('never');
    try {
      const dateObj = date instanceof Date ? date : new Date(date as string);
      if (Number.isNaN(dateObj.getTime())) return t('never');
      return format(dateObj, 'MMM d, yyyy HH:mm');
    } catch {
      return t('never');
    }
  };

  const columns: DataTableColumnConfig<SigningKeyRow>[] = [
    {
      key: 'icon',
      header: '',
      width: '50px',
      className: 'pl-4',
      render: (row: SigningKeyRow) => (
        <div className="flex items-center justify-center">
          <Avatar
            initial={row.kid?.charAt(0) ?? 'K'}
            size="sm"
            icon={<Fingerprint className="h-3 w-3 text-muted-foreground" />}
          />
        </div>
      ),
    },
    {
      key: 'kid',
      header: t('kid'),
      width: '180px',
      render: (row: SigningKeyRow) => <span className="font-mono text-sm">{row.kid}</span>,
    },
    {
      key: 'active',
      header: t('active'),
      width: '100px',
      render: (row: SigningKeyRow) => (
        <Badge variant={row.active ? 'default' : 'secondary'}>
          {row.active ? t('activeYes') : t('activeNo')}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: t('createdAt'),
      width: '160px',
      render: (row: SigningKeyRow) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'rotatedAt',
      header: t('rotatedAt'),
      width: '160px',
      render: (row: SigningKeyRow) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.rotatedAt ?? null)}</span>
      ),
    },
    {
      key: 'publicKeyPem',
      header: t('publicKey'),
      className: 'min-w-[80px]',
      render: (row: SigningKeyRow) =>
        row.publicKeyPem ? (
          <CopyToClipboard text={row.publicKeyPem} size="sm" variant="ghost" showText={false} />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  const skeletonConfig: { columns: TableSkeletonColumnConfig[]; rowCount: number } = {
    columns: columns.map((col) => ({
      key: col.key,
      type: 'text',
      width: col.width,
    })),
    rowCount: 3,
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {error.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <DataTable<SigningKeyRow>
        data={signingKeys}
        columns={columns}
        loading={loading}
        emptyState={{
          icon: <Fingerprint />,
          title: t('empty'),
          description: t('emptyDescription'),
          action: (
            <Button onClick={() => setSigningKeysRotateDialogOpen(true)}>
              <Fingerprint className="mr-2 h-4 w-4" />
              {t('emptyAction')}
            </Button>
          ),
        }}
        skeletonConfig={skeletonConfig}
      />
    </>
  );
}
