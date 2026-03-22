'use client';

import { useTranslations } from 'next-intl';
import { GetSigningKeysQuery } from '@grantjs/schema';
import { Calendar, Clock, Fingerprint } from 'lucide-react';

import { Audit, type AuditField } from '@/components/common';
import { formatTimestamp } from '@/lib/utils';

type SigningKeyRow = GetSigningKeysQuery['signingKeys'][number];

interface SigningKeyAuditProps {
  signingKey: SigningKeyRow;
  className?: string;
}

export function SigningKeyAudit({ signingKey, className }: SigningKeyAuditProps) {
  const t = useTranslations('common.audit');

  const auditFields: AuditField[] = [
    {
      key: 'id',
      icon: <Fingerprint className="h-3 w-3" />,
      label: t('id'),
      getValue: (row: SigningKeyRow) => row.id,
    },
    {
      key: 'createdAt',
      icon: <Calendar className="h-3 w-3" />,
      label: t('created'),
      getValue: (row: SigningKeyRow) => formatTimestamp(row.createdAt),
    },
    {
      key: 'updatedAt',
      icon: <Clock className="h-3 w-3" />,
      label: t('updated'),
      getValue: (row: SigningKeyRow) => formatTimestamp(row.updatedAt),
    },
  ];

  return <Audit fields={auditFields} item={signingKey} className={className} />;
}
