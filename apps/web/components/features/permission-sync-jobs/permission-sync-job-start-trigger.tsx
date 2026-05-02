'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGrant, type UseGrantResult } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';
import { Download, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useScopeFromParams } from '@/hooks/common';
import { cn } from '@/lib/utils';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

type StartTriggerLayout = 'empty' | 'toolbar';

export interface PermissionSyncJobStartTriggerProps {
  /** `toolbar` matches responsive icon + label layout in `PermissionSyncJobToolbar`. */
  layout?: StartTriggerLayout;
}

/**
 * Opens the start-sync dialog. Respects project `Update` grant and loading state
 * (useGrant defaults to false while the check is in flight — see start dialog).
 */
export function PermissionSyncJobStartTrigger({
  layout = 'empty',
}: PermissionSyncJobStartTriggerProps) {
  const t = useTranslations('permissionSyncJobs');
  const scope = useScopeFromParams();
  const params = useParams();
  const projectId = params.projectId as string | undefined;
  const setStartDialogOpen = usePermissionSyncJobsStore((s) => s.setStartDialogOpen);

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

  const open = () => setStartDialogOpen(true);

  if (isLoading) {
    if (layout === 'toolbar') {
      return (
        <Button
          type="button"
          disabled
          className={cn(
            'w-full sm:w-auto',
            'min-[640px]:max-[1199px]:size-9 min-[640px]:max-[1199px]:min-w-9 min-[640px]:max-[1199px]:max-w-9 min-[640px]:max-[1199px]:p-2',
            'min-[1200px]:size-auto min-[1200px]:min-w-0 min-[1200px]:max-w-none'
          )}
          aria-label={t('toolbar.start')}
        >
          <Loader2 className="size-4 shrink-0 animate-spin" />
          <span className="inline min-[640px]:max-[1199px]:hidden min-[1200px]:inline">
            {t('toolbar.start')}
          </span>
        </Button>
      );
    }
    return (
      <Button type="button" disabled className="gap-2" variant="default">
        <Loader2 className="size-4 shrink-0 animate-spin" />
        {t('toolbar.start')}
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
            onClick={open}
            className={cn(
              'w-full sm:w-auto',
              'min-[640px]:max-[1199px]:size-9 min-[640px]:max-[1199px]:min-w-9 min-[640px]:max-[1199px]:max-w-9 min-[640px]:max-[1199px]:p-2',
              'min-[1200px]:size-auto min-[1200px]:min-w-0 min-[1200px]:max-w-none'
            )}
            aria-label={t('toolbar.start')}
          >
            <Download className="size-4 shrink-0" />
            <span className="inline min-[640px]:max-[1199px]:hidden min-[1200px]:inline">
              {t('toolbar.start')}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{t('toolbar.start')}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button type="button" onClick={open} className="gap-2">
      <Download className="size-4 shrink-0" />
      {t('toolbar.start')}
    </Button>
  );
}
