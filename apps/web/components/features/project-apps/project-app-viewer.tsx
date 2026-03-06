'use client';

import { useCallback, useEffect } from 'react';

import { useGrant } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';

import { useScopeFromParams } from '@/hooks/common';
import { useProjectApps } from '@/hooks/project-apps';
import { useProjectAppsStore } from '@/stores/project-apps.store';

import { ProjectAppCards } from './project-app-cards';
import { ProjectAppSecretDialog } from './project-app-secret-dialog';
import { ProjectAppTable } from './project-app-table';
import { ProjectAppView } from './project-app-types';

export function ProjectAppViewer() {
  const scope = useScopeFromParams();
  const view = useProjectAppsStore((state) => state.view);
  const page = useProjectAppsStore((state) => state.page);
  const limit = useProjectAppsStore((state) => state.limit);
  const search = useProjectAppsStore((state) => state.search);
  const sort = useProjectAppsStore((state) => state.sort);
  const selectedTagIds = useProjectAppsStore((state) => state.selectedTagIds);
  const setTotalCount = useProjectAppsStore((state) => state.setTotalCount);
  const setProjectApps = useProjectAppsStore((state) => state.setProjectApps);
  const setLoading = useProjectAppsStore((state) => state.setLoading);
  const setRefetch = useProjectAppsStore((state) => state.setRefetch);
  const createdProjectApp = useProjectAppsStore((state) => state.createdProjectApp);
  const secretDialogOpen = useProjectAppsStore((state) => state.secretDialogOpen);
  const setSecretDialogOpen = useProjectAppsStore((state) => state.setSecretDialogOpen);
  const setCreatedProjectApp = useProjectAppsStore((state) => state.setCreatedProjectApp);

  const { projectApps, loading, totalCount, refetch } = useProjectApps({
    scope: scope!,
    page,
    limit,
    search,
    sort,
    tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
  });

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    setRefetch(handleRefetch);
    return () => setRefetch(null);
  }, [handleRefetch, setRefetch]);

  useEffect(() => {
    setProjectApps(projectApps);
  }, [projectApps, setProjectApps]);

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  useEffect(() => {
    if (totalCount && totalCount !== 0) {
      setTotalCount(totalCount);
    }
  }, [totalCount, setTotalCount]);

  const canQuery = useGrant(ResourceSlug.ProjectApp, ResourceAction.Query, {
    scope: scope!,
  });

  if (!scope || !canQuery) return null;

  return (
    <>
      {view === ProjectAppView.TABLE ? <ProjectAppTable /> : <ProjectAppCards />}
      {createdProjectApp && (
        <ProjectAppSecretDialog
          open={secretDialogOpen}
          onOpenChange={(open) => {
            setSecretDialogOpen(open);
            if (!open) setCreatedProjectApp(null);
          }}
          clientId={createdProjectApp.clientId}
          clientSecret={createdProjectApp.clientSecret ?? null}
          scope={scope ? { tenant: scope.tenant, id: scope.id } : null}
        />
      )}
    </>
  );
}
