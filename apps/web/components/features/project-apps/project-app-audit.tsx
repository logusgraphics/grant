'use client';

import { ProjectApp } from '@grantjs/schema';
import { Calendar, Clock, Fingerprint } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Audit, type AuditField } from '@/components/common';
import { formatTimestamp } from '@/lib/utils';

interface ProjectAppAuditProps {
  projectApp: ProjectApp;
  className?: string;
}

export function ProjectAppAudit({ projectApp, className }: ProjectAppAuditProps) {
  const t = useTranslations('common.audit');

  const auditFields: AuditField[] = [
    {
      key: 'id',
      icon: <Fingerprint className="h-3 w-3" />,
      label: t('id'),
      getValue: (app: ProjectApp) => app.id,
    },
    {
      key: 'createdAt',
      icon: <Calendar className="h-3 w-3" />,
      label: t('created'),
      getValue: (app: ProjectApp) => formatTimestamp(app.createdAt),
    },
    {
      key: 'updatedAt',
      icon: <Clock className="h-3 w-3" />,
      label: t('updated'),
      getValue: (app: ProjectApp) => formatTimestamp(app.updatedAt),
    },
  ];

  return <Audit fields={auditFields} item={projectApp} className={className} />;
}
