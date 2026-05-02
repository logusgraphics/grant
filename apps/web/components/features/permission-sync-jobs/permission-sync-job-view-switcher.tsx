'use client';

import { useTranslations } from 'next-intl';
import { LayoutGrid, Table } from 'lucide-react';

import { type ViewOption, ViewSwitcher } from '@/components/common';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

import { PermissionSyncJobView } from './permission-sync-job-types';

export function PermissionSyncJobViewSwitcher() {
  const t = useTranslations('permissionSyncJobs');
  const view = usePermissionSyncJobsStore((state) => state.view);
  const setView = usePermissionSyncJobsStore((state) => state.setView);

  const viewOptions: ViewOption[] = [
    { value: PermissionSyncJobView.CARDS, icon: LayoutGrid, label: t('view.cards') },
    { value: PermissionSyncJobView.TABLE, icon: Table, label: t('view.table') },
  ];

  return (
    <ViewSwitcher
      currentView={view}
      onViewChange={(newView) => setView(newView as PermissionSyncJobView)}
      options={viewOptions}
    />
  );
}
