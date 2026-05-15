'use client';

import { useTranslations } from 'next-intl';
import { ProjectSyncJobStatus } from '@grantjs/schema';

import { cn } from '@/lib/utils';

interface PermissionSyncJobStatusBadgeProps {
  status: ProjectSyncJobStatus;
  className?: string;
}

const STATUS_VISUALS: Record<ProjectSyncJobStatus, { className: string; labelKey: string }> = {
  [ProjectSyncJobStatus.Pending]: {
    className: 'text-muted-foreground',
    labelKey: 'status.pending',
  },
  [ProjectSyncJobStatus.Running]: {
    className: 'text-blue-600',
    labelKey: 'status.running',
  },
  [ProjectSyncJobStatus.Completed]: {
    className: 'text-green-600',
    labelKey: 'status.completed',
  },
  [ProjectSyncJobStatus.Failed]: {
    className: 'text-destructive',
    labelKey: 'status.failed',
  },
  [ProjectSyncJobStatus.Cancelled]: {
    className: 'text-muted-foreground',
    labelKey: 'status.cancelled',
  },
};

export function PermissionSyncJobStatusBadge({
  status,
  className,
}: PermissionSyncJobStatusBadgeProps) {
  const t = useTranslations('permissionSyncJobs');
  const visuals = STATUS_VISUALS[status];

  return <span className={cn('text-sm', visuals.className, className)}>{t(visuals.labelKey)}</span>;
}
