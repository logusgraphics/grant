'use client';

import { useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGrant } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';

import { useScopeFromParams } from '@/hooks/common';
import { useProjectSyncJobs } from '@/hooks/projects';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

import { PermissionSyncJobCards } from './permission-sync-job-cards';
import { PermissionSyncJobTable } from './permission-sync-job-table';
import { PermissionSyncJobView } from './permission-sync-job-types';

export function PermissionSyncJobViewer() {
  const scope = useScopeFromParams();
  const params = useParams();
  const projectId = params.projectId as string;

  const view = usePermissionSyncJobsStore((state) => state.view);
  const page = usePermissionSyncJobsStore((state) => state.page);
  const limit = usePermissionSyncJobsStore((state) => state.limit);
  const search = usePermissionSyncJobsStore((state) => state.search);
  const sort = usePermissionSyncJobsStore((state) => state.sort);
  const status = usePermissionSyncJobsStore((state) => state.status);

  const setJobs = usePermissionSyncJobsStore((state) => state.setJobs);
  const setTotalCount = usePermissionSyncJobsStore((state) => state.setTotalCount);
  const setLoading = usePermissionSyncJobsStore((state) => state.setLoading);
  const setRefetch = usePermissionSyncJobsStore((state) => state.setRefetch);

  const { jobs, totalCount, loading, refetch } = useProjectSyncJobs({
    id: projectId,
    scope: scope ?? undefined,
    page,
    limit,
    search: search || undefined,
    sort,
    status: status ?? undefined,
  });

  const handleRefetch = useCallback(() => refetch(), [refetch]);

  useEffect(() => {
    setRefetch(handleRefetch);
    return () => setRefetch(null);
  }, [handleRefetch, setRefetch]);

  useEffect(() => {
    setJobs(jobs);
  }, [jobs, setJobs]);

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  useEffect(() => {
    setTotalCount(totalCount);
  }, [totalCount, setTotalCount]);

  const canQuery = useGrant(ResourceSlug.Project, ResourceAction.Query, {
    scope: scope!,
  });

  if (!scope || !canQuery) {
    return null;
  }

  switch (view) {
    case PermissionSyncJobView.CARDS:
      return <PermissionSyncJobCards />;
    case PermissionSyncJobView.TABLE:
    default:
      return <PermissionSyncJobTable />;
  }
}
