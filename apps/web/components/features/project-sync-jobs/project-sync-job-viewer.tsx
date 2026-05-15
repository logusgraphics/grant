'use client';

import { useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGrant } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';

import { useScopeFromParams } from '@/hooks/common';
import { useProjectSyncJobs } from '@/hooks/projects';
import { useProjectSyncJobsStore } from '@/stores/project-sync-jobs.store';

import { ProjectSyncJobCards } from './project-sync-job-cards';
import { ProjectSyncJobTable } from './project-sync-job-table';
import { ProjectSyncJobView } from './project-sync-job-types';

export function ProjectSyncJobViewer() {
  const scope = useScopeFromParams();
  const params = useParams();
  const projectId = params.projectId as string;

  const view = useProjectSyncJobsStore((state) => state.view);
  const page = useProjectSyncJobsStore((state) => state.page);
  const limit = useProjectSyncJobsStore((state) => state.limit);
  const search = useProjectSyncJobsStore((state) => state.search);
  const sort = useProjectSyncJobsStore((state) => state.sort);
  const status = useProjectSyncJobsStore((state) => state.status);

  const setJobs = useProjectSyncJobsStore((state) => state.setJobs);
  const setTotalCount = useProjectSyncJobsStore((state) => state.setTotalCount);
  const setLoading = useProjectSyncJobsStore((state) => state.setLoading);
  const setRefetch = useProjectSyncJobsStore((state) => state.setRefetch);

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
    case ProjectSyncJobView.CARDS:
      return <ProjectSyncJobCards />;
    case ProjectSyncJobView.TABLE:
    default:
      return <ProjectSyncJobTable />;
  }
}
