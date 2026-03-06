'use client';

import { useGrant } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';

import { RefreshButton, Toolbar } from '@/components/common';
import { useScopeFromParams } from '@/hooks/common';
import { useProjectAppsStore } from '@/stores/project-apps.store';

import { ProjectAppCreateDialog } from './project-app-create-dialog';
import { ProjectAppLimit } from './project-app-limit';
import { ProjectAppSearch } from './project-app-search';
import { ProjectAppSorter } from './project-app-sorter';
import { ProjectAppTagSelector } from './project-app-tag-selector';
import { ProjectAppViewSwitcher } from './project-app-view-switcher';

export function ProjectAppToolbar() {
  const scope = useScopeFromParams();
  const refetch = useProjectAppsStore((state) => state.refetch);
  const loading = useProjectAppsStore((state) => state.loading);

  const canCreate = useGrant(ResourceSlug.ProjectApp, ResourceAction.Create, {
    scope: scope!,
  });

  const toolbarItems = [
    <RefreshButton key="refresh" onRefresh={refetch ?? undefined} loading={loading} />,
    <ProjectAppSearch key="search" />,
    <ProjectAppSorter key="sorter" />,
    <ProjectAppTagSelector key="tags" />,
    <ProjectAppLimit key="limit" />,
    <ProjectAppViewSwitcher key="view" />,
    ...(canCreate ? [<ProjectAppCreateDialog key="create" />] : []),
  ];

  return <Toolbar items={toolbarItems} />;
}
