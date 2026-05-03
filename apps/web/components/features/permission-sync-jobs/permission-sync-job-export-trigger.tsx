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
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

type ExportTriggerLayout = 'empty' | 'toolbar';

export interface PermissionSyncJobExportTriggerProps {
  /** `toolbar` matches responsive icon + label layout in `PermissionSyncJobToolbar`. */
  layout?: ExportTriggerLayout;
}

/**
 * Trigger for the standalone "export current state to CDM" REST endpoint.
 *
 * Gated by `Project:Query` (read-only): an operator who can view the project
 * is allowed to back up its permission graph. Hidden entirely when the
 * permission check resolves to `false`. While the grant check is in-flight
 * the button is rendered disabled with a spinner so layout does not jump.
 *
 * On click, opens the export dialog so the operator can choose CDM sections
 * before downloading JSON from `GET /api/projects/:id/permissions/export`.
 */
export function PermissionSyncJobExportTrigger({
  layout = 'empty',
}: PermissionSyncJobExportTriggerProps) {
  const t = useTranslations('permissionSyncJobs');
  const scope = useScopeFromParams();
  const params = useParams();
  const projectId = params.projectId as string | undefined;
  const setExportDialogOpen = usePermissionSyncJobsStore((s) => s.setExportDialogOpen);

  const projectGrantContext = useMemo(
    () =>
      projectId ? { resource: { id: projectId, scope: { projects: [projectId] } } } : undefined,
    [projectId]
  );

  const { isGranted, isLoading } = useGrant(ResourceSlug.Project, ResourceAction.Query, {
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
