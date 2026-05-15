'use client';

import { useTranslations } from 'next-intl';
import { ProjectSyncJob } from '@grantjs/schema';

import {
  Avatar,
  DataTable,
  type DataTableColumnConfig,
  type TableSkeletonColumnConfig,
} from '@/components/common';
import { formatTimestamp } from '@/lib/utils';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

import { PermissionSyncJobActions } from './permission-sync-job-actions';
import { formatModeStrategy, getJobAvatarInitial } from './permission-sync-job-display';
import { PermissionSyncJobExportTrigger } from './permission-sync-job-export-trigger';
import { PermissionSyncJobOperationBadge } from './permission-sync-job-operation-badge';
import { PermissionSyncJobStartTrigger } from './permission-sync-job-start-trigger';
import { PermissionSyncJobStatusBadge } from './permission-sync-job-status-badge';
import { PermissionSyncJobsModuleIconElement } from './permission-sync-jobs-icon';

export function PermissionSyncJobTable() {
  const t = useTranslations('permissionSyncJobs');
  const tStart = useTranslations('permissionSyncJobs.startDialog');

  const limit = usePermissionSyncJobsStore((state) => state.limit);
  const search = usePermissionSyncJobsStore((state) => state.search);
  const status = usePermissionSyncJobsStore((state) => state.status);
  const jobs = usePermissionSyncJobsStore((state) => state.jobs);
  const loading = usePermissionSyncJobsStore((state) => state.loading);
  const columns: DataTableColumnConfig<ProjectSyncJob>[] = [
    {
      key: 'avatar',
      header: '',
      width: '60px',
      className: 'pl-4',
      render: (job) => <Avatar initial={getJobAvatarInitial(job)} size="md" />,
    },
    {
      key: 'jobName',
      header: t('table.jobName'),
      width: '200px',
      render: (job) => (
        <span className="text-sm font-mono break-all">
          {job.jobName ?? <span className="text-muted-foreground">{t('table.noJobName')}</span>}
        </span>
      ),
    },
    {
      key: 'operation',
      header: t('table.operation'),
      width: '100px',
      render: (job) => <PermissionSyncJobOperationBadge operation={job.operation} />,
    },
    {
      key: 'modeStrategy',
      header: t('table.strategy'),
      width: '110px',
      render: (job) => (
        <span className="text-sm text-muted-foreground">{formatModeStrategy(job, tStart)}</span>
      ),
    },
    {
      key: 'cdmVersion',
      header: t('table.cdmVersion'),
      width: '110px',
      render: (job) => <span className="text-sm">v{job.cdmVersion}</span>,
    },
    {
      key: 'status',
      header: t('table.status'),
      width: '140px',
      render: (job) => <PermissionSyncJobStatusBadge status={job.status} />,
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
      { key: 'avatar', type: 'avatar' },
      { key: 'jobName', type: 'text' },
      { key: 'operation', type: 'text' },
      { key: 'modeStrategy', type: 'text' },
      { key: 'cdmVersion', type: 'text' },
      { key: 'status', type: 'text' },
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
        icon: <PermissionSyncJobsModuleIconElement />,
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
