'use client';

import { useTranslations } from 'next-intl';
import { ProjectSyncJob } from '@grantjs/schema';
import { Calendar, CalendarClock, Clock } from 'lucide-react';

import { Audit, type AuditField } from '@/components/common';
import { formatTimestamp } from '@/lib/utils';

interface ProjectSyncJobAuditProps {
  job: ProjectSyncJob;
  className?: string;
}

/**
 * Card-footer lifecycle timestamps, aligned with {@link SigningKeyAudit} / {@link ApiKeyAudit}.
 */
export function ProjectSyncJobAudit({ job, className }: ProjectSyncJobAuditProps) {
  const t = useTranslations('projectSyncJobs');

  const auditFields: AuditField[] = [
    {
      key: 'enqueued',
      icon: <Calendar className="h-3 w-3" />,
      label: t('sort.enqueuedAt'),
      getValue: (j: ProjectSyncJob) => formatTimestamp(j.enqueuedAt),
    },
  ];

  if (job.startedAt) {
    auditFields.push({
      key: 'started',
      icon: <Clock className="h-3 w-3" />,
      label: t('sort.startedAt'),
      getValue: (j: ProjectSyncJob) => (j.startedAt ? formatTimestamp(j.startedAt) : ''),
    });
  }

  if (job.completedAt) {
    auditFields.push({
      key: 'completed',
      icon: <CalendarClock className="h-3 w-3" />,
      label: t('sort.completedAt'),
      getValue: (j: ProjectSyncJob) => (j.completedAt ? formatTimestamp(j.completedAt) : ''),
    });
  } else if (job.cancelledAt) {
    auditFields.push({
      key: 'cancelled',
      icon: <CalendarClock className="h-3 w-3" />,
      label: t('audit.cancelled'),
      getValue: (j: ProjectSyncJob) => (j.cancelledAt ? formatTimestamp(j.cancelledAt) : ''),
    });
  }

  return <Audit fields={auditFields} item={job} className={className} />;
}
