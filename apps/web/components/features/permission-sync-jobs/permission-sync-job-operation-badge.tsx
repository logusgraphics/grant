'use client';

import { useTranslations } from 'next-intl';
import { ProjectSyncJobOperation } from '@grantjs/schema';

import { valueBadgeClassName } from '@/components/common/scroll-badges';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { getOperationLabelKey } from './permission-sync-job-display';

interface PermissionSyncJobOperationBadgeProps {
  operation: ProjectSyncJobOperation;
  className?: string;
}

export function PermissionSyncJobOperationBadge({
  operation,
  className,
}: PermissionSyncJobOperationBadgeProps) {
  const t = useTranslations('permissionSyncJobs');

  return (
    <Badge variant="outline" className={cn(valueBadgeClassName, className)}>
      {t(getOperationLabelKey(operation))}
    </Badge>
  );
}
