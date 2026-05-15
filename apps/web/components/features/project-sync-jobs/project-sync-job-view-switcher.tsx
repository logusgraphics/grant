'use client';

import { useTranslations } from 'next-intl';
import { LayoutGrid, Table } from 'lucide-react';

import { type ViewOption, ViewSwitcher } from '@/components/common';
import { useProjectSyncJobsStore } from '@/stores/project-sync-jobs.store';

import { ProjectSyncJobView } from './project-sync-job-types';

export function ProjectSyncJobViewSwitcher() {
  const t = useTranslations('projectSyncJobs');
  const view = useProjectSyncJobsStore((state) => state.view);
  const setView = useProjectSyncJobsStore((state) => state.setView);

  const viewOptions: ViewOption[] = [
    { value: ProjectSyncJobView.CARDS, icon: LayoutGrid, label: t('view.cards') },
    { value: ProjectSyncJobView.TABLE, icon: Table, label: t('view.table') },
  ];

  return (
    <ViewSwitcher
      currentView={view}
      onViewChange={(newView) => setView(newView as ProjectSyncJobView)}
      options={viewOptions}
    />
  );
}
