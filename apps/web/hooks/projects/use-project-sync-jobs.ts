import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApolloClient, NetworkStatus } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import {
  ProjectSyncJob,
  ProjectSyncJobPage,
  ProjectSyncJobsDocument,
  ProjectSyncJobSortInput,
  ProjectSyncJobStatus,
  QueryProjectSyncJobsArgs,
  Scope,
  SyncProjectInput,
} from '@grantjs/schema';

import {
  buildProjectSyncJobArtifactUrl,
  downloadJsonArtifact,
  fetchProjectSyncJobArtifact,
  type ProjectSyncJobArtifactKind,
} from '@/lib/project-sync-job-artifact.lib';

const POLL_INTERVAL_MS = 5000;
const ACTIVE_STATUSES: ReadonlyArray<ProjectSyncJobStatus> = [
  ProjectSyncJobStatus.Pending,
  ProjectSyncJobStatus.Running,
];

interface UseProjectSyncJobsParams {
  id: string;
  scope: Scope | null | undefined;
  page?: number;
  limit?: number;
  search?: string | null;
  sort?: ProjectSyncJobSortInput | null;
  status?: ProjectSyncJobStatus | null;
  disablePolling?: boolean;
}

interface UseProjectSyncJobsResult {
  jobs: ProjectSyncJob[];
  totalCount: number;
  hasNextPage: boolean;
  loading: boolean;
  polling: boolean;
  error: Error | undefined;
  hasActiveJob: boolean;
  refetch: (
    variables?: Partial<QueryProjectSyncJobsArgs>
  ) => Promise<ApolloClient.QueryResult<{ projectSyncJobs: ProjectSyncJobPage }>>;
}

export function useProjectSyncJobs(params: UseProjectSyncJobsParams): UseProjectSyncJobsResult {
  const { id, scope, page, limit, search, sort, status, disablePolling } = params;

  const skip = useMemo(() => !id || !scope || !scope.id || !scope.tenant, [id, scope]);

  const variables = useMemo<QueryProjectSyncJobsArgs>(
    () => ({
      id,
      scope: scope ?? ({} as Scope),
      page,
      limit,
      search: search ?? undefined,
      sort: sort ?? undefined,
      status: status ?? undefined,
    }),
    [id, scope, page, limit, search, sort, status]
  );

  const { data, loading, error, networkStatus, refetch, startPolling, stopPolling } = useQuery<{
    projectSyncJobs: ProjectSyncJobPage;
  }>(ProjectSyncJobsDocument, {
    variables,
    skip,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const jobs = useMemo(() => data?.projectSyncJobs?.jobs ?? [], [data]);
  const totalCount = data?.projectSyncJobs?.totalCount ?? 0;
  const hasNextPage = data?.projectSyncJobs?.hasNextPage ?? false;

  const hasActiveJob = useMemo(
    () => jobs.some((job) => ACTIVE_STATUSES.includes(job.status)),
    [jobs]
  );

  useEffect(() => {
    if (skip || disablePolling) {
      stopPolling();
      return;
    }
    if (hasActiveJob) {
      startPolling(POLL_INTERVAL_MS);
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [hasActiveJob, skip, disablePolling, startPolling, stopPolling]);

  return {
    jobs,
    totalCount,
    hasNextPage,
    loading: loading && networkStatus !== NetworkStatus.poll,
    polling: networkStatus === NetworkStatus.poll,
    error: error as Error | undefined,
    hasActiveJob,
    refetch,
  };
}

interface UseProjectSyncJobArtifactParams {
  id: string;
  scope: Scope | null | undefined;
  jobId: string | null | undefined;
  kind: ProjectSyncJobArtifactKind;
  skip?: boolean;
}

interface UseProjectSyncJobArtifactResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  download: () => Promise<void>;
  reload: () => Promise<void>;
}

function useProjectSyncJobArtifact<T>(
  params: UseProjectSyncJobArtifactParams
): UseProjectSyncJobArtifactResult<T> {
  const { id, scope, jobId, kind, skip } = params;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const url = useMemo(() => {
    if (!id || !jobId || !scope?.id || !scope.tenant) return null;
    return buildProjectSyncJobArtifactUrl(id, jobId, scope, kind);
  }, [id, jobId, scope, kind]);

  const fetchData = useCallback(async (): Promise<T | null> => {
    if (!url) return null;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProjectSyncJobArtifact<T>(url, kind);
      setData(result);
      return result;
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err));
      setError(wrapped);
      return null;
    } finally {
      setLoading(false);
    }
  }, [url, kind]);

  useEffect(() => {
    setData(null);
    setError(null);
    if (skip || !url) return;
    void fetchData();
  }, [url, fetchData, skip]);

  const download = useCallback(async () => {
    let content = data;
    if (!content) {
      content = await fetchData();
      if (!content) return;
    }
    const baseName =
      kind === 'payload'
        ? `cdm-${(content as { jobName?: string | null }).jobName ?? jobId ?? 'payload'}`
        : `cdm-snapshot-${jobId ?? 'job'}`;
    downloadJsonArtifact(content, `${baseName}.json`);
  }, [data, fetchData, jobId, kind]);

  const reload = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { data, loading, error, download, reload };
}

interface UseProjectSyncJobPayloadParams {
  id: string;
  scope: Scope | null | undefined;
  jobId: string | null | undefined;
}

export function useProjectSyncJobPayload(params: UseProjectSyncJobPayloadParams) {
  const artifact = useProjectSyncJobArtifact<Record<string, unknown>>({
    ...params,
    kind: 'payload',
  });
  return {
    payload: artifact.data,
    loading: artifact.loading,
    error: artifact.error,
    download: artifact.download,
    reload: artifact.reload,
  };
}

interface UseProjectSyncJobSnapshotParams {
  id: string;
  scope: Scope | null | undefined;
  jobId: string | null | undefined;
  skip?: boolean;
}

export function useProjectSyncJobSnapshot(params: UseProjectSyncJobSnapshotParams) {
  const artifact = useProjectSyncJobArtifact<SyncProjectInput>({
    ...params,
    kind: 'snapshot',
  });
  return {
    snapshot: artifact.data,
    loading: artifact.loading,
    error: artifact.error,
    download: artifact.download,
    reload: artifact.reload,
  };
}
