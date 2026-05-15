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

import { getApiBaseUrl } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';

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
  /** Disable polling regardless of job activity (e.g. when the page is hidden). */
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

/**
 * Paginated query for project permission sync jobs. Polls every 5 seconds
 * while at least one job in the current page is `PENDING` or `RUNNING` so
 * the table reflects lifecycle transitions; stops polling when no active
 * jobs remain.
 */
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

interface UseProjectSyncJobPayloadParams {
  id: string;
  scope: Scope | null | undefined;
  jobId: string | null | undefined;
}

interface UseProjectSyncJobPayloadResult {
  payload: Record<string, unknown> | null;
  loading: boolean;
  error: Error | null;
  /** Triggers a browser download of the original CDM JSON payload. */
  download: () => Promise<void>;
  /** Re-fetches the payload (useful to retry after a transient error). */
  reload: () => Promise<void>;
}

/**
 * Fetch the original CDM JSON body that was submitted when a sync job was
 * enqueued. Calls the REST `payload` endpoint to avoid pushing potentially
 * large blobs through Apollo's normalized cache. Exposes a `download()`
 * helper that triggers a browser save.
 */
export function useProjectSyncJobPayload(
  params: UseProjectSyncJobPayloadParams
): UseProjectSyncJobPayloadResult {
  const { id, scope, jobId } = params;
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const buildUrl = useCallback(() => {
    if (!id || !jobId || !scope || !scope.id || !scope.tenant) return null;
    const apiBase = getApiBaseUrl();
    const search = new URLSearchParams({ scopeId: scope.id, tenant: scope.tenant });
    return `${apiBase}/api/projects/${id}/sync/jobs/${jobId}/payload?${search.toString()}`;
  }, [id, scope, jobId]);

  const fetchPayload = useCallback(async (): Promise<Record<string, unknown> | null> => {
    const url = buildUrl();
    if (!url) return null;
    setLoading(true);
    setError(null);
    try {
      const accessToken = useAuthStore.getState().accessToken;
      const res = await fetch(url, {
        credentials: 'include',
        headers: {
          accept: 'application/json',
          ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      if (!res.ok) {
        let bodyText = '';
        try {
          bodyText = await res.text();
        } catch {
          bodyText = res.statusText;
        }
        throw new Error(bodyText || `Failed to load payload (${res.status})`);
      }
      const data = (await res.json()) as Record<string, unknown>;
      setPayload(data);
      return data;
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err));
      setError(wrapped);
      return null;
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  useEffect(() => {
    setPayload(null);
    setError(null);
    if (!buildUrl()) return;
    void fetchPayload();
  }, [buildUrl, fetchPayload]);

  const download = useCallback(async () => {
    let content = payload;
    if (!content) {
      content = await fetchPayload();
      if (!content) return;
    }
    if (typeof window === 'undefined') return;
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const jobName = (content as { jobName?: string | null }).jobName ?? null;
    const filename = `cdm-${jobName ?? jobId ?? 'payload'}.json`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [payload, fetchPayload, jobId]);

  const reload = useCallback(async () => {
    await fetchPayload();
  }, [fetchPayload]);

  return { payload, loading, error, download, reload };
}

interface UseProjectSyncJobSnapshotParams {
  id: string;
  scope: Scope | null | undefined;
  jobId: string | null | undefined;
  /**
   * Skip the initial fetch (e.g. before the job's `hasSnapshot` flag is true).
   * The hook still exposes `download` / `reload` so callers can fetch lazily
   * once the snapshot becomes available.
   */
  skip?: boolean;
}

interface UseProjectSyncJobSnapshotResult {
  snapshot: SyncProjectInput | null;
  loading: boolean;
  error: Error | null;
  /** Triggers a browser download of the rollback snapshot JSON. */
  download: () => Promise<void>;
  reload: () => Promise<void>;
}

/**
 * Fetch the pre-sync rollback snapshot captured by the worker for a given
 * sync job. Mirrors {@link useProjectSyncJobPayload} but hits the
 * `snapshot` REST endpoint. Returns `null` and sets `error` to a 404-shaped
 * value when the job has no snapshot.
 */
export function useProjectSyncJobSnapshot(
  params: UseProjectSyncJobSnapshotParams
): UseProjectSyncJobSnapshotResult {
  const { id, scope, jobId, skip } = params;
  const [snapshot, setSnapshot] = useState<SyncProjectInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const buildUrl = useCallback(() => {
    if (!id || !jobId || !scope || !scope.id || !scope.tenant) return null;
    const apiBase = getApiBaseUrl();
    const search = new URLSearchParams({ scopeId: scope.id, tenant: scope.tenant });
    return `${apiBase}/api/projects/${id}/sync/jobs/${jobId}/snapshot?${search.toString()}`;
  }, [id, scope, jobId]);

  const fetchSnapshot = useCallback(async (): Promise<SyncProjectInput | null> => {
    const url = buildUrl();
    if (!url) return null;
    setLoading(true);
    setError(null);
    try {
      const accessToken = useAuthStore.getState().accessToken;
      const res = await fetch(url, {
        credentials: 'include',
        headers: {
          accept: 'application/json',
          ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      if (!res.ok) {
        let bodyText = '';
        try {
          bodyText = await res.text();
        } catch {
          bodyText = res.statusText;
        }
        throw new Error(bodyText || `Failed to load snapshot (${res.status})`);
      }
      const data = (await res.json()) as SyncProjectInput;
      setSnapshot(data);
      return data;
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err));
      setError(wrapped);
      return null;
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  useEffect(() => {
    setSnapshot(null);
    setError(null);
    if (skip) return;
    if (!buildUrl()) return;
    void fetchSnapshot();
  }, [buildUrl, fetchSnapshot, skip]);

  const download = useCallback(async () => {
    let content = snapshot;
    if (!content) {
      content = await fetchSnapshot();
      if (!content) return;
    }
    if (typeof window === 'undefined') return;
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const filename = `cdm-snapshot-${jobId ?? 'job'}.json`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [snapshot, fetchSnapshot, jobId]);

  const reload = useCallback(async () => {
    await fetchSnapshot();
  }, [fetchSnapshot]);

  return { snapshot, loading, error, download, reload };
}
