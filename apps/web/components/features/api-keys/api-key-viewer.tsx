'use client';

import { useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useGrant } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';
import { ApiKey, Scope, Tenant } from '@grantjs/schema';
import { format } from 'date-fns';
import { KeyRound } from 'lucide-react';

import {
  Avatar,
  CopyToClipboard,
  DataTable,
  type DataTableColumnConfig,
  type TableSkeletonColumnConfig,
} from '@/components/common';
import { useApiKeys } from '@/hooks/api-keys';
import { useScopeFromParams } from '@/hooks/common';
import { useApiKeysStore } from '@/stores/api-keys.store';

import { ApiKeyActions } from './api-key-actions';
import { ApiKeyAudit } from './api-key-audit';
import { ApiKeyCards } from './api-key-cards';
import { ApiKeyCreateDialog } from './api-key-create-dialog';
import { ApiKeySecretDialog } from './api-key-secret-dialog';

export interface ApiKeyViewerProps {
  /** When not provided, scope is derived from URL params. */
  scope?: Scope | null;
}

export function ApiKeyViewer({ scope: scopeProp }: ApiKeyViewerProps) {
  const scopeFromParams = useScopeFromParams();
  const scope = scopeProp ?? scopeFromParams;

  const t = useTranslations('user.apiKeys');
  const tRoot = useTranslations();
  const page = useApiKeysStore((state) => state.page);
  const limit = useApiKeysStore((state) => state.limit);
  const search = useApiKeysStore((state) => state.search);
  const sort = useApiKeysStore((state) => state.sort);
  const secretDialogOpen = useApiKeysStore((state) => state.secretDialogOpen);
  const createdApiKey = useApiKeysStore((state) => state.createdApiKey);
  const setTotalCount = useApiKeysStore((state) => state.setTotalCount);
  const setRefetch = useApiKeysStore((state) => state.setRefetch);
  const setLoading = useApiKeysStore((state) => state.setLoading);
  const setApiKeys = useApiKeysStore((state) => state.setApiKeys);
  const setSecretDialogOpen = useApiKeysStore((state) => state.setSecretDialogOpen);
  const setCreatedApiKey = useApiKeysStore((state) => state.setCreatedApiKey);
  const handleApiKeyCreated = useApiKeysStore((state) => state.handleApiKeyCreated);
  const view = useApiKeysStore((state) => state.view);

  const { apiKeys, loading, error, totalCount, refetch } = useApiKeys({
    scope: scope!,
    page,
    limit,
    search,
    sort,
  });

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    setRefetch(handleRefetch);
    return () => setRefetch(null);
  }, [handleRefetch, setRefetch]);

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  useEffect(() => {
    setTotalCount(totalCount);
  }, [totalCount, setTotalCount]);

  useEffect(() => {
    setApiKeys(apiKeys);
  }, [apiKeys, setApiKeys]);

  const canQuery = useGrant(ResourceSlug.ApiKey, ResourceAction.Query, {
    scope: scope!,
  });

  if (!scope || !canQuery) {
    return null;
  }

  const showRoleColumn =
    scope.tenant === Tenant.AccountProject || scope.tenant === Tenant.OrganizationProject;

  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return t('never');
    try {
      const dateObj = date instanceof Date ? date : new Date(date as string);
      if (isNaN(dateObj.getTime())) return t('never');
      return format(dateObj, 'MMM d, yyyy');
    } catch {
      return t('never');
    }
  };

  const columns: DataTableColumnConfig<ApiKey>[] = [
    {
      key: 'icon',
      header: '',
      width: '50px',
      className: 'pl-4',
      render: (apiKey: ApiKey) => (
        <div className="flex items-center justify-center">
          <Avatar
            initial={apiKey.name?.charAt(0) || apiKey.clientId.charAt(0)}
            size="sm"
            icon={<KeyRound className="h-3 w-3 text-muted-foreground" />}
          />
        </div>
      ),
    },
    {
      key: 'name',
      header: t('table.name'),
      width: '200px',
      render: (apiKey: ApiKey) => (
        <span className="text-sm font-medium">{apiKey.name || apiKey.clientId}</span>
      ),
    },
    {
      key: 'clientId',
      header: t('table.clientId'),
      width: '300px',
      render: (apiKey: ApiKey) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-mono">{apiKey.clientId}</span>
          <CopyToClipboard text={apiKey.clientId} size="sm" variant="ghost" />
        </div>
      ),
    },
    {
      key: 'description',
      header: t('table.description'),
      width: '250px',
      render: (apiKey: ApiKey) => (
        <span className="text-sm text-muted-foreground">
          {apiKey.description || t('noDescription')}
        </span>
      ),
    },
    ...(showRoleColumn
      ? [
          {
            key: 'role',
            header: t('table.role'),
            width: '150px',
            render: (apiKey: ApiKey) => (
              <span className="text-sm text-muted-foreground">
                {tRoot(apiKey.role?.name ?? '—')}
              </span>
            ),
          },
        ]
      : []),
    {
      key: 'status',
      header: t('table.status'),
      width: '120px',
      render: (apiKey: ApiKey) => (
        <span
          className={`text-sm ${
            apiKey.isRevoked
              ? 'text-destructive'
              : apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()
                ? 'text-orange-500'
                : 'text-green-600'
          }`}
        >
          {apiKey.isRevoked
            ? t('status.revoked')
            : apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()
              ? t('status.expired')
              : t('status.active')}
        </span>
      ),
    },
    {
      key: 'expiresAt',
      header: t('table.expiresAt'),
      width: '150px',
      render: (apiKey: ApiKey) => (
        <span className="text-sm text-muted-foreground">{formatDate(apiKey.expiresAt)}</span>
      ),
    },
    {
      key: 'lastUsedAt',
      header: t('table.lastUsedAt'),
      width: '150px',
      render: (apiKey: ApiKey) => (
        <span className="text-sm text-muted-foreground">{formatDate(apiKey.lastUsedAt)}</span>
      ),
    },
    {
      key: 'audit',
      header: t('table.audit'),
      width: '200px',
      render: (apiKey: ApiKey) => <ApiKeyAudit apiKey={apiKey} />,
    },
  ];

  const skeletonConfig: { columns: TableSkeletonColumnConfig[]; rowCount?: number } = {
    columns: [
      { key: 'icon', type: 'text' },
      { key: 'name', type: 'text' },
      { key: 'clientId', type: 'text' },
      { key: 'description', type: 'text' },
      ...(showRoleColumn ? [{ key: 'role' as const, type: 'text' as const }] : []),
      { key: 'status', type: 'text' },
      { key: 'expiresAt', type: 'text' },
      { key: 'lastUsedAt', type: 'text' },
      { key: 'audit', type: 'audit' },
    ],
    rowCount: 5,
  };

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-destructive">{t('error')}</p>
      </div>
    );
  }

  if (view === 'card') {
    return (
      <>
        <ApiKeyCards />
        {createdApiKey && (
          <ApiKeySecretDialog
            open={secretDialogOpen}
            onOpenChange={(open) => {
              setSecretDialogOpen(open);
              if (!open) setCreatedApiKey(null);
            }}
            clientId={createdApiKey.clientId}
            clientSecret={createdApiKey.clientSecret}
            scope={scope ? { tenant: scope.tenant, id: scope.id } : null}
          />
        )}
      </>
    );
  }

  return (
    <>
      <DataTable
        data={apiKeys}
        columns={columns}
        loading={loading}
        emptyState={{
          icon: <KeyRound />,
          title: t('empty'),
          description: t('emptyDescription'),
          action: (
            <ApiKeyCreateDialog onApiKeyCreated={handleApiKeyCreated} triggerAlwaysShowLabel />
          ),
        }}
        actionsColumn={{
          render: (apiKey: ApiKey) => <ApiKeyActions apiKey={apiKey} scope={scope!} />,
        }}
        skeletonConfig={skeletonConfig}
      />
      {createdApiKey && (
        <ApiKeySecretDialog
          open={secretDialogOpen}
          onOpenChange={(open) => {
            setSecretDialogOpen(open);
            if (!open) setCreatedApiKey(null);
          }}
          clientId={createdApiKey.clientId}
          clientSecret={createdApiKey.clientSecret}
          scope={scope ? { tenant: scope.tenant, id: scope.id } : null}
        />
      )}
    </>
  );
}
