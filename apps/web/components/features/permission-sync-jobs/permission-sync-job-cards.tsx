'use client';

import { useTranslations } from 'next-intl';
import { ProjectPermissionsSyncJob } from '@grantjs/schema';
import { Activity, Fingerprint, History } from 'lucide-react';

import { CardBody, CardGrid, CardHeader } from '@/components/common';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

import { PermissionSyncJobActions } from './permission-sync-job-actions';
import { PermissionSyncJobAudit } from './permission-sync-job-audit';
import { PermissionSyncJobCardSkeleton } from './permission-sync-job-card-skeleton';
import { PermissionSyncJobExportTrigger } from './permission-sync-job-export-trigger';
import { PermissionSyncJobStartTrigger } from './permission-sync-job-start-trigger';
import { PermissionSyncJobStatusBadge } from './permission-sync-job-status-badge';

export function PermissionSyncJobCards() {
  const t = useTranslations('permissionSyncJobs');

  const limit = usePermissionSyncJobsStore((state) => state.limit);
  const search = usePermissionSyncJobsStore((state) => state.search);
  const status = usePermissionSyncJobsStore((state) => state.status);
  const jobs = usePermissionSyncJobsStore((state) => state.jobs);
  const loading = usePermissionSyncJobsStore((state) => state.loading);
  const isFiltered = !!search || status !== null;

  return (
    <CardGrid<ProjectPermissionsSyncJob>
      entities={jobs}
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
      skeleton={{
        component: <PermissionSyncJobCardSkeleton />,
        count: limit,
      }}
      renderHeader={(job) => (
        <CardHeader
          avatar={{ initial: '#', size: 'lg' }}
          title={job.importId ?? t('table.noImportId')}
          description={`v${job.cdmVersion}`}
          actions={<PermissionSyncJobActions job={job} />}
        />
      )}
      renderBody={(job) => (
        <CardBody
          items={[
            {
              label: {
                icon: <Activity className="h-3 w-3" />,
                text: t('table.status'),
              },
              value: <PermissionSyncJobStatusBadge status={job.status} />,
            },
            {
              label: {
                icon: <Fingerprint className="h-3 w-3" />,
                text: t('table.jobId'),
              },
              value: <span className="text-xs font-mono break-all">{job.id}</span>,
            },
          ]}
        />
      )}
      renderFooter={(job) => <PermissionSyncJobAudit job={job} />}
    />
  );
}
