'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGrant, type UseGrantResult } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';
import { Loader2, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useScopeFromParams } from '@/hooks/common';
import { cn } from '@/lib/utils';
import { useProjectSyncJobsStore } from '@/stores/project-sync-jobs.store';

type ExportTriggerLayout = 'empty' | 'toolbar';

export interface ProjectSyncJobExportTriggerProps {
  /** `toolbar` matches responsive icon + label layout in `ProjectSyncJobToolbar`. */
  layout?: ExportTriggerLayout;
}

/**
 * Opens the export dialog to enqueue an async CDM export job (same lifecycle as import).
 *
 * Gated by `Project:Update`. Download the generated CDM from the jobs list or job details
 * once the export completes.
 */
export function ProjectSyncJobExportTrigger({
  layout = 'empty',
}: ProjectSyncJobExportTriggerProps) {
  const t = useTranslations('projectSyncJobs');
  const scope = useScopeFromParams();
  const params = useParams();
  const projectId = params.projectId as string | undefined;
  const setExportDialogOpen = useProjectSyncJobsStore((s) => s.setExportDialogOpen);

  const projectGrantContext = useMemo(
    () =>
      projectId ? { resource: { id: projectId, scope: { projects: [projectId] } } } : undefined,
    [projectId]
  );

  const { isGranted, isLoading } = useGrant(ResourceSlug.Project, ResourceAction.Update, {
    scope,
    context: projectGrantContext,
    returnLoading: true,
  }) as UseGrantResult;

  const onClick = () => {
    setExportDialogOpen(true);
  };

  if (isLoading) {
    if (layout === 'toolbar') {
      return (
        <Button
          type="button"
          variant="outline"
          disabled
          className={cn(
            'w-full sm:w-auto',
            'min-[640px]:max-[1199px]:size-9 min-[640px]:max-[1199px]:min-w-9 min-[640px]:max-[1199px]:max-w-9 min-[640px]:max-[1199px]:p-2',
            'min-[1200px]:size-auto min-[1200px]:min-w-0 min-[1200px]:max-w-none'
          )}
          aria-label={t('toolbar.export')}
        >
          <Loader2 className="size-4 shrink-0 animate-spin" />
          <span className="inline min-[640px]:max-[1199px]:hidden min-[1200px]:inline">
            {t('toolbar.export')}
          </span>
        </Button>
      );
    }
    return (
      <Button type="button" variant="outline" disabled className="gap-2">
        <Loader2 className="size-4 shrink-0 animate-spin" />
        {t('toolbar.export')}
      </Button>
    );
  }

  if (!isGranted) {
    return null;
  }

  if (layout === 'toolbar') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            onClick={onClick}
            className={cn(
              'w-full sm:w-auto',
              'min-[640px]:max-[1199px]:size-9 min-[640px]:max-[1199px]:min-w-9 min-[640px]:max-[1199px]:max-w-9 min-[640px]:max-[1199px]:p-2',
              'min-[1200px]:size-auto min-[1200px]:min-w-0 min-[1200px]:max-w-none'
            )}
            aria-label={t('toolbar.export')}
          >
            <Upload className="size-4 shrink-0" />
            <span className="inline min-[640px]:max-[1199px]:hidden min-[1200px]:inline">
              {t('toolbar.export')}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{t('toolbar.export')}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button type="button" variant="outline" onClick={onClick} className="gap-2">
      <Upload className="size-4 shrink-0" />
      {t('toolbar.export')}
    </Button>
  );
}
