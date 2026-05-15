'use client';

import { useTranslations } from 'next-intl';
import { ProjectSyncJob } from '@grantjs/schema';

import { valueBadgeClassName } from '@/components/common/scroll-badges';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { formatModeStrategy } from './project-sync-job-display';

interface ProjectSyncJobModeBadgeProps {
  job: Pick<ProjectSyncJob, 'modeStrategy'>;
  className?: string;
}

export function ProjectSyncJobModeBadge({ job, className }: ProjectSyncJobModeBadgeProps) {
  const tStart = useTranslations('projectSyncJobs.startDialog');

  if (!job.modeStrategy) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <Badge variant="outline" className={cn(valueBadgeClassName, className)}>
      {formatModeStrategy(job, tStart)}
    </Badge>
  );
}
