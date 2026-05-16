'use client';

import { useTranslations } from 'next-intl';

import { valueBadgeClassName } from '@/components/common/scroll-badges';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProjectSyncJobConfirmDestructiveBadgeProps {
  confirmed: boolean;
  className?: string;
}

export function ProjectSyncJobConfirmDestructiveBadge({
  confirmed,
  className,
}: ProjectSyncJobConfirmDestructiveBadgeProps) {
  const tStart = useTranslations('projectSyncJobs.startDialog');

  return (
    <Badge variant="outline" className={cn(valueBadgeClassName, className)}>
      {confirmed ? tStart('summary.confirmDestructiveYes') : tStart('summary.confirmDestructiveNo')}
    </Badge>
  );
}
