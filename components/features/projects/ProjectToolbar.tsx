'use client';

import { useTranslations } from 'next-intl';

import { Toolbar } from '@/components/common';

import { CreateProjectDialog } from './CreateProjectDialog';
import { ProjectLimit } from './ProjectLimit';
import { ProjectSearch } from './ProjectSearch';
import { ProjectSorter } from './ProjectSorter';
import { ProjectTagSelector } from './ProjectTagSelector';
import { ProjectViewSwitcher } from './ProjectViewSwitcher';

export function ProjectToolbar() {
  const t = useTranslations('projects');

  return (
    <Toolbar
      items={[
        <ProjectSearch key="search" />,
        <ProjectSorter key="sorter" />,
        <ProjectTagSelector key="tagSelector" />,
        <ProjectLimit key="limit" />,
        <ProjectViewSwitcher key="viewSwitcher" />,
        <CreateProjectDialog key="create" />,
      ]}
    />
  );
}
