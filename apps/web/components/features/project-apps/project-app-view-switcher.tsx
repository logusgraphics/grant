'use client';

import { useTranslations } from 'next-intl';
import { LayoutGrid, Table } from 'lucide-react';

import { type ViewOption, ViewSwitcher } from '@/components/common';
import { type ProjectAppView, useProjectAppsStore } from '@/stores/project-apps.store';

export function ProjectAppViewSwitcher() {
  const t = useTranslations('projectApps');

  const view = useProjectAppsStore((state) => state.view);
  const setView = useProjectAppsStore((state) => state.setView);

  const options: ViewOption[] = [
    { value: 'card', icon: LayoutGrid, label: t('view.card') },
    { value: 'table', icon: Table, label: t('view.table') },
  ];

  return (
    <ViewSwitcher
      currentView={view}
      onViewChange={(newView) => setView(newView as ProjectAppView)}
      options={options}
    />
  );
}
