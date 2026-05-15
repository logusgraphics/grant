'use client';

import { useTranslations } from 'next-intl';
import { ProjectSyncJob } from '@grantjs/schema';
import { Activity, FileJson } from 'lucide-react';

import { CardBody, CardGrid, CardHeader } from '@/components/common';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

import { PermissionSyncJobActions } from './permission-sync-job-actions';
import { PermissionSyncJobAudit } from './permission-sync-job-audit';
import { PermissionSyncJobCardSkeleton } from './permission-sync-job-card-skeleton';
import {
  formatModeStrategy,
  getJobAvatarInitial,
  getOperationLabelKey,
} from './permission-sync-job-display';
import { PermissionSyncJobExportTrigger } from './permission-sync-job-export-trigger';
import { PermissionSyncJobStartTrigger } from './permission-sync-job-start-trigger';
import { PermissionSyncJobStatusBadge } from './permission-sync-job-status-badge';
import {
  PermissionSyncJobsModuleIcon,
  PermissionSyncJobsModuleIconElement,
} from './permission-sync-jobs-icon';

export function PermissionSyncJobCards() {
  const t = useTranslations('permissionSyncJobs');
  const tStart = useTranslations('permissionSyncJobs.startDialog');

  const limit = usePermissionSyncJobsStore((state) => state.limit);
  const search = usePermissionSyncJobsStore((state) => state.search);
  const status = usePermissionSyncJobsStore((state) => state.status);
  const jobs = usePermissionSyncJobsStore((state) => state.jobs);
  const loading = usePermissionSyncJobsStore((state) => state.loading);
  const isFiltered = !!search || status !== null;

  return (
    <CardGrid<ProjectSyncJob>
      entities={jobs}
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
      skeleton={{
        component: <PermissionSyncJobCardSkeleton />,
        count: limit,
      }}
      renderHeader={(job) => (
        <CardHeader
          avatar={{ initial: getJobAvatarInitial(job), size: 'lg' }}
          title={job.jobName ?? t('table.noJobName')}
          description={t(getOperationLabelKey(job.operation))}
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
                icon: <PermissionSyncJobsModuleIcon className="h-3 w-3" />,
                text: t('table.strategy'),
              },
              value: (
                <span className="text-sm text-muted-foreground">
                  {formatModeStrategy(job, tStart)}
                </span>
              ),
            },
            {
              label: {
                icon: <FileJson className="h-3 w-3" />,
                text: t('table.cdmVersion'),
              },
              value: <span className="text-sm">v{job.cdmVersion}</span>,
            },
          ]}
        />
      )}
      renderFooter={(job) => <PermissionSyncJobAudit job={job} />}
    />
  );
}
