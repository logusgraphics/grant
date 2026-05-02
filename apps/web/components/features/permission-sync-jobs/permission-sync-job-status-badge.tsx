'use client';

import { useTranslations } from 'next-intl';
import { ProjectPermissionsSyncJobStatus } from '@grantjs/schema';
import { AlertTriangle, Ban, CheckCircle2, Clock, Loader2, type LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PermissionSyncJobStatusBadgeProps {
  status: ProjectPermissionsSyncJobStatus;
  className?: string;
}

interface StatusVisuals {
  icon: LucideIcon;
  className: string;
  iconClassName?: string;
  labelKey: string;
}

const STATUS_VISUALS: Record<ProjectPermissionsSyncJobStatus, StatusVisuals> = {
  [ProjectPermissionsSyncJobStatus.Pending]: {
    icon: Clock,
    className:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200',
    labelKey: 'status.pending',
  },
  [ProjectPermissionsSyncJobStatus.Running]: {
    icon: Loader2,
    className:
      'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200',
    iconClassName: 'animate-spin',
    labelKey: 'status.running',
  },
  [ProjectPermissionsSyncJobStatus.Completed]: {
    icon: CheckCircle2,
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200',
    labelKey: 'status.completed',
  },
  [ProjectPermissionsSyncJobStatus.Failed]: {
    icon: AlertTriangle,
    className:
      'border-destructive/40 bg-destructive/10 text-destructive dark:border-destructive/40 dark:bg-destructive/20',
    labelKey: 'status.failed',
  },
  [ProjectPermissionsSyncJobStatus.Cancelled]: {
    icon: Ban,
    className: 'border-muted-foreground/30 bg-muted text-muted-foreground',
    labelKey: 'status.cancelled',
  },
};

export function PermissionSyncJobStatusBadge({
  status,
  className,
}: PermissionSyncJobStatusBadgeProps) {
  const t = useTranslations('permissionSyncJobs');
  const visuals = STATUS_VISUALS[status];
  const Icon = visuals.icon;

  return (
    <Badge variant="outline" className={cn(visuals.className, className)}>
      <Icon className={cn('h-3 w-3', visuals.iconClassName)} />
      {t(visuals.labelKey)}
    </Badge>
  );
}
