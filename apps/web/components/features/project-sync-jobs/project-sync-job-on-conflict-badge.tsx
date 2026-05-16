'use client';

import { useTranslations } from 'next-intl';
import { CdmOnConflict } from '@grantjs/schema';

import { valueBadgeClassName } from '@/components/common/scroll-badges';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { getOnConflictLabelKey } from './project-sync-job-display';

interface ProjectSyncJobOnConflictBadgeProps {
  onConflict: CdmOnConflict;
  className?: string;
}

export function ProjectSyncJobOnConflictBadge({
  onConflict,
  className,
}: ProjectSyncJobOnConflictBadgeProps) {
  const tStart = useTranslations('projectSyncJobs.startDialog');

  return (
    <Badge variant="outline" className={cn(valueBadgeClassName, className)}>
      {tStart(getOnConflictLabelKey(onConflict))}
    </Badge>
  );
}
