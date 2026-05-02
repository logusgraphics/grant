'use client';

import { useTranslations } from 'next-intl';
import { ProjectPermissionsSyncJob } from '@grantjs/schema';
import { Calendar, CalendarClock, Clock } from 'lucide-react';

import { Audit, type AuditField } from '@/components/common';
import { formatTimestamp } from '@/lib/utils';

interface PermissionSyncJobAuditProps {
  job: ProjectPermissionsSyncJob;
  className?: string;
}

/**
 * Card-footer lifecycle timestamps, aligned with {@link SigningKeyAudit} / {@link ApiKeyAudit}.
 */
export function PermissionSyncJobAudit({ job, className }: PermissionSyncJobAuditProps) {
  const t = useTranslations('permissionSyncJobs');

  const auditFields: AuditField[] = [
    {
      key: 'enqueued',
      icon: <Calendar className="h-3 w-3" />,
      label: t('sort.enqueuedAt'),
      getValue: (j: ProjectPermissionsSyncJob) => formatTimestamp(j.enqueuedAt),
    },
  ];

  if (job.startedAt) {
    auditFields.push({
      key: 'started',
      icon: <Clock className="h-3 w-3" />,
      label: t('sort.startedAt'),
      getValue: (j: ProjectPermissionsSyncJob) => (j.startedAt ? formatTimestamp(j.startedAt) : ''),
    });
  }

  if (job.completedAt) {
    auditFields.push({
      key: 'completed',
      icon: <CalendarClock className="h-3 w-3" />,
      label: t('sort.completedAt'),
      getValue: (j: ProjectPermissionsSyncJob) =>
        j.completedAt ? formatTimestamp(j.completedAt) : '',
    });
  } else if (job.cancelledAt) {
    auditFields.push({
      key: 'cancelled',
      icon: <CalendarClock className="h-3 w-3" />,
      label: t('audit.cancelled'),
      getValue: (j: ProjectPermissionsSyncJob) =>
        j.cancelledAt ? formatTimestamp(j.cancelledAt) : '',
    });
  }

  return <Audit fields={auditFields} item={job} className={className} />;
}
