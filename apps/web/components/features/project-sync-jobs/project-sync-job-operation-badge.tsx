'use client';

import { useTranslations } from 'next-intl';
import { ProjectSyncJobOperation } from '@grantjs/schema';

import { valueBadgeClassName } from '@/components/common/scroll-badges';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { getOperationLabelKey } from './project-sync-job-display';

interface ProjectSyncJobOperationBadgeProps {
  operation: ProjectSyncJobOperation;
  className?: string;
}

export function ProjectSyncJobOperationBadge({
  operation,
  className,
}: ProjectSyncJobOperationBadgeProps) {
  const t = useTranslations('projectSyncJobs');

  return (
    <Badge variant="outline" className={cn(valueBadgeClassName, className)}>
      {t(getOperationLabelKey(operation))}
    </Badge>
  );
}
