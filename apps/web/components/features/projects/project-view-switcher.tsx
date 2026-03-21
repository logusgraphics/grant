'use client';

import { useTranslations } from 'next-intl';
import { LayoutGrid, Table } from 'lucide-react';

import { type ViewOption, ViewSwitcher } from '@/components/common';
import { useProjectsStore } from '@/stores/projects.store';

import { ProjectView } from './project-types';

export function ProjectViewSwitcher() {
  const t = useTranslations('projects');

  const view = useProjectsStore((state) => state.view);
  const setView = useProjectsStore((state) => state.setView);

  const projectViewOptions: ViewOption[] = [
    {
      value: ProjectView.CARD,
      icon: LayoutGrid,
      label: t('view.card'),
    },
    {
      value: ProjectView.TABLE,
      icon: Table,
      label: t('view.table'),
    },
  ];

  return (
    <ViewSwitcher
      currentView={view}
      onViewChange={(newView) => setView(newView as ProjectView)}
      options={projectViewOptions}
    />
  );
}
