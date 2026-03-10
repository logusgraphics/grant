'use client';

import { ApiKey } from '@grantjs/schema';
import { Calendar, Clock, Fingerprint } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Audit, type AuditField } from '@/components/common';
import { formatTimestamp } from '@/lib/utils';

interface ApiKeyAuditProps {
  apiKey: ApiKey;
  className?: string;
}

export function ApiKeyAudit({ apiKey, className }: ApiKeyAuditProps) {
  const t = useTranslations('common.audit');

  const auditFields: AuditField[] = [
    {
      key: 'id',
      icon: <Fingerprint className="h-3 w-3" />,
      label: t('id'),
      getValue: (key: ApiKey) => key.id,
    },
    {
      key: 'createdAt',
      icon: <Calendar className="h-3 w-3" />,
      label: t('created'),
      getValue: (key: ApiKey) => formatTimestamp(key.createdAt),
    },
    {
      key: 'updatedAt',
      icon: <Clock className="h-3 w-3" />,
      label: t('updated'),
      getValue: (key: ApiKey) => formatTimestamp(key.updatedAt),
    },
  ];

  return <Audit fields={auditFields} item={apiKey} className={className} />;
}
