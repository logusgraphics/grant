'use client';

import { useTranslations } from 'next-intl';
import { ChevronDown, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  PERMISSION_SYNC_JOB_STATUS_FILTERS,
  usePermissionSyncJobsStore,
} from '@/stores/permission-sync-jobs.store';

export function PermissionSyncJobStatusFilter() {
  const t = useTranslations('permissionSyncJobs');
  const status = usePermissionSyncJobsStore((state) => state.status);
  const setStatus = usePermissionSyncJobsStore((state) => state.setStatus);

  const activeOption = PERMISSION_SYNC_JOB_STATUS_FILTERS.find((opt) => opt.value === status);
  const activeLabel = activeOption ? t(activeOption.labelKey) : t('status.all');
  const tooltipText = `${t('filter.status')}: ${activeLabel}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="default"
                className="w-full sm:w-auto sm:max-[1599px]:aspect-square sm:max-[1599px]:p-2 min-[1600px]:px-4 min-[1600px]:py-2"
              >
                <div className="flex w-full items-center justify-center min-[1600px]:justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <Filter className="size-4 shrink-0" />
                    <span className="hidden max-sm:inline min-[1600px]:inline">
                      {t('filter.status')}: {activeLabel}
                    </span>
                  </div>
                  <ChevronDown className="size-4 shrink-0 hidden min-[1600px]:block" />
                </div>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">{tooltipText}</TooltipContent>
          <DropdownMenuContent align="end" className="w-48" fullWidthOnMobile>
            <DropdownMenuLabel>{t('filter.status')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PERMISSION_SYNC_JOB_STATUS_FILTERS.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value ?? 'all'}
                checked={status === option.value}
                onCheckedChange={() => setStatus(option.value)}
              >
                {t(option.labelKey)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </TooltipProvider>
  );
}
