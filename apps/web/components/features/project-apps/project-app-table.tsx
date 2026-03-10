'use client';

import { getTagBorderClasses, TagColor } from '@grantjs/constants';
import { LayoutGrid } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Avatar,
  CopyToClipboard,
  DataTable,
  ScrollBadges,
  type DataTableColumnConfig,
  type TableSkeletonColumnConfig,
} from '@/components/common';
import { useScopeFromParams } from '@/hooks/common';
import { transformTagsToBadges } from '@/lib/tag';
import { cn } from '@/lib/utils';
import { useProjectAppsStore } from '@/stores/project-apps.store';

import { ProjectAppActions } from './project-app-actions';
import { ProjectAppAudit } from './project-app-audit';
import { ProjectAppCreateDialog } from './project-app-create-dialog';

import type { ProjectApp, Tag } from '@grantjs/schema';

export function ProjectAppTable() {
  const t = useTranslations('projectApps');
  const scope = useScopeFromParams();
  const projectApps = useProjectAppsStore((state) => state.projectApps);
  const loading = useProjectAppsStore((state) => state.loading);
  const search = useProjectAppsStore((state) => state.search);

  const hasActiveFilters = search.trim() !== '';

  if (!scope) return null;

  const columns: DataTableColumnConfig<ProjectApp>[] = [
    {
      key: 'icon',
      header: '',
      width: '50px',
      className: 'pl-4',
      render: (app: ProjectApp) => {
        const primaryTagColor = app.tags?.find((tag: Tag) => tag.isPrimary)?.color;
        return (
          <div className="flex items-center justify-center">
            <Avatar
              initial={(app.name || app.clientId).charAt(0)}
              size="sm"
              icon={<LayoutGrid className="h-3 w-3 text-muted-foreground" />}
              className={
                primaryTagColor
                  ? cn('border-2', getTagBorderClasses(primaryTagColor as TagColor))
                  : undefined
              }
            />
          </div>
        );
      },
    },
    {
      key: 'name',
      header: t('table.name'),
      width: '180px',
      render: (app: ProjectApp) => (
        <span className="text-sm font-medium">{app.name || app.clientId}</span>
      ),
    },
    {
      key: 'clientId',
      header: t('table.clientId'),
      width: '280px',
      render: (app: ProjectApp) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-mono truncate">{app.clientId}</span>
          <CopyToClipboard text={app.clientId} size="sm" variant="ghost" />
        </div>
      ),
    },
    {
      key: 'allowSignUp',
      header: t('table.allowSignUp'),
      width: '100px',
      render: (app: ProjectApp) => (
        <span className="text-sm text-muted-foreground">
          {app.allowSignUp !== false ? t('common.yes') : t('common.no')}
        </span>
      ),
    },
    {
      key: 'signUpRole',
      header: t('table.signUpRole'),
      width: '140px',
      render: (app: ProjectApp) => {
        const signUpRole = (app as { signUpRole?: { id: string; name: string } | null }).signUpRole;
        if (app.allowSignUp === false || !signUpRole) return <span className="text-sm">—</span>;
        return <span className="text-sm text-muted-foreground">{signUpRole.name}</span>;
      },
    },
    {
      key: 'redirectUris',
      header: t('table.redirectUris'),
      width: '200px',
      render: (app: ProjectApp) => (
        <ScrollBadges
          items={
            app.redirectUris?.map((uri) => ({
              id: uri,
              label: uri,
            })) ?? []
          }
          height={60}
        />
      ),
    },
    {
      key: 'enabledProviders',
      header: t('table.enabledProviders'),
      width: '140px',
      render: (app: ProjectApp) => (
        <ScrollBadges
          items={
            app.enabledProviders?.map((p) => ({
              id: p,
              label: t(`providers.${p}` as 'providers.email' | 'providers.github'),
            })) ?? []
          }
          height={60}
        />
      ),
    },
    {
      key: 'scopes',
      header: t('table.scopes'),
      width: '150px',
      render: (app: ProjectApp) => (
        <ScrollBadges
          items={
            app.scopes?.map((s) => ({
              id: s,
              label: s,
            })) ?? []
          }
          height={60}
        />
      ),
    },
    {
      key: 'tags',
      header: t('table.tags'),
      width: '200px',
      render: (app: ProjectApp) => (
        <ScrollBadges items={transformTagsToBadges(app.tags)} height={60} showAsRound={true} />
      ),
    },
    {
      key: 'audit',
      header: t('table.audit'),
      width: '200px',
      render: (app: ProjectApp) => <ProjectAppAudit projectApp={app} />,
    },
  ];

  const skeletonConfig: { columns: TableSkeletonColumnConfig[]; rowCount?: number } = {
    columns: [
      { key: 'icon', type: 'text' },
      { key: 'name', type: 'text' },
      { key: 'clientId', type: 'text' },
      { key: 'allowSignUp', type: 'text' },
      { key: 'signUpRole', type: 'text' },
      { key: 'redirectUris', type: 'list' },
      { key: 'enabledProviders', type: 'list' },
      { key: 'scopes', type: 'list' },
      { key: 'tags', type: 'list' },
      { key: 'audit', type: 'audit' },
    ],
    rowCount: 5,
  };

  return (
    <DataTable<ProjectApp>
      data={projectApps}
      columns={columns}
      loading={loading}
      emptyState={{
        icon: <LayoutGrid />,
        title: hasActiveFilters ? t('noSearchResults.title') : t('empty.title'),
        description: hasActiveFilters ? t('noSearchResults.description') : t('empty.description'),
        action: hasActiveFilters ? undefined : <ProjectAppCreateDialog triggerAlwaysShowLabel />,
      }}
      actionsColumn={{
        render: (app: ProjectApp) => <ProjectAppActions projectApp={app} scope={scope} />,
      }}
      skeletonConfig={skeletonConfig}
    />
  );
}
