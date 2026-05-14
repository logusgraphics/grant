'use client';

import { useTranslations } from 'next-intl';
import { ProjectSyncJob } from '@grantjs/schema';
import { History } from 'lucide-react';

import {
  DataTable,
  type DataTableColumnConfig,
  type TableSkeletonColumnConfig,
} from '@/components/common';
import { formatTimestamp } from '@/lib/utils';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

import { PermissionSyncJobActions } from './permission-sync-job-actions';
import { PermissionSyncJobExportTrigger } from './permission-sync-job-export-trigger';
import { PermissionSyncJobStartTrigger } from './permission-sync-job-start-trigger';
import { PermissionSyncJobStatusBadge } from './permission-sync-job-status-badge';

export function PermissionSyncJobTable() {
  const t = useTranslations('permissionSyncJobs');

  const limit = usePermissionSyncJobsStore((state) => state.limit);
  const search = usePermissionSyncJobsStore((state) => state.search);
  const status = usePermissionSyncJobsStore((state) => state.status);
  const jobs = usePermissionSyncJobsStore((state) => state.jobs);
  const loading = usePermissionSyncJobsStore((state) => state.loading);
  const columns: DataTableColumnConfig<ProjectSyncJob>[] = [
    {
      key: 'status',
      header: t('table.status'),
      width: '140px',
      render: (job) => <PermissionSyncJobStatusBadge status={job.status} />,
    },
    {
      key: 'importId',
      header: t('table.importId'),
      width: '220px',
      render: (job) => (
        <span className="text-sm font-mono break-all">
          {job.importId ?? <span className="text-muted-foreground">{t('table.noImportId')}</span>}
        </span>
      ),
    },
    {
      key: 'cdmVersion',
      header: t('table.cdmVersion'),
      width: '110px',
      render: (job) => <span className="text-sm">v{job.cdmVersion}</span>,
    },
    {
      key: 'enqueuedAt',
      header: t('table.enqueuedAt'),
      width: '180px',
      render: (job) => (
        <span className="text-sm text-muted-foreground">{formatTimestamp(job.enqueuedAt)}</span>
      ),
    },
    {
      key: 'startedAt',
      header: t('table.startedAt'),
      width: '180px',
      render: (job) => (
        <span className="text-sm text-muted-foreground">
          {job.startedAt ? formatTimestamp(job.startedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'completedAt',
      header: t('table.completedAt'),
      width: '180px',
      render: (job) => (
        <span className="text-sm text-muted-foreground">
          {job.completedAt ? formatTimestamp(job.completedAt) : '—'}
        </span>
      ),
    },
  ];

  const skeletonConfig: { columns: TableSkeletonColumnConfig[]; rowCount?: number } = {
    columns: [
      { key: 'status', type: 'text' },
      { key: 'importId', type: 'text' },
      { key: 'cdmVersion', type: 'text' },
      { key: 'enqueuedAt', type: 'text' },
      { key: 'startedAt', type: 'text' },
      { key: 'completedAt', type: 'text' },
    ],
    rowCount: limit,
  };

  const isFiltered = !!search || status !== null;

  return (
    <DataTable
      data={jobs}
      columns={columns}
      loading={loading}
      emptyState={{
        icon: <History />,
        title: isFiltered ? t('noResults.title') : t('empty.title'),
        description: isFiltered ? t('noResults.description') : t('empty.description'),
        action: isFiltered ? undefined : (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <PermissionSyncJobStartTrigger />
            <PermissionSyncJobExportTrigger />
          </div>
        ),
      }}
      actionsColumn={{
        render: (job) => <PermissionSyncJobActions job={job} />,
      }}
      skeletonConfig={skeletonConfig}
    />
  );
}
