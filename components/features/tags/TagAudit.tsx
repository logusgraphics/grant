'use client';

import { Fingerprint, Calendar, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Audit, AuditField } from '@/components/common';
import { Tag } from '@/graphql/generated/types';

interface TagAuditProps {
  tag: Tag;
}

export function TagAudit({ tag }: TagAuditProps) {
  const t = useTranslations('common');

  const fields: AuditField[] = [
    {
      key: 'id',
      icon: <Fingerprint className="h-3 w-3" />,
      label: t('audit.id'),
      getValue: (item: Tag) => item.id,
    },
    {
      key: 'created',
      icon: <Calendar className="h-3 w-3" />,
      label: t('audit.created'),
      getValue: (item: Tag) => item.createdAt,
    },
    {
      key: 'updated',
      icon: <Clock className="h-3 w-3" />,
      label: t('audit.updated'),
      getValue: (item: Tag) => item.updatedAt,
    },
  ];

  return <Audit fields={fields} item={tag} />;
}
