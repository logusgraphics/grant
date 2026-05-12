import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApolloClient, NetworkStatus } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type { CdmExportSection } from '@grantjs/core';
import { CDM_EXPORT_SECTIONS } from '@grantjs/core';
import {
  ProjectPermissionsSyncJob,
  ProjectPermissionsSyncJobPage,
  ProjectPermissionsSyncJobsDocument,
  ProjectPermissionsSyncJobSortInput,
  ProjectPermissionsSyncJobStatus,
  QueryProjectPermissionsSyncJobsArgs,
  Scope,
  SyncProjectPermissionsInput,
} from '@grantjs/schema';

import { getApiBaseUrl } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';

const POLL_INTERVAL_MS = 5000;
const ACTIVE_STATUSES: ReadonlyArray<ProjectPermissionsSyncJobStatus> = [
  ProjectPermissionsSyncJobStatus.Pending,
  ProjectPermissionsSyncJobStatus.Running,
];

interface UseProjectPermissionsSyncJobsParams {
  id: string;
  scope: Scope | null | undefined;
  page?: number;
  limit?: number;
  search?: string | null;
  sort?: ProjectPermissionsSyncJobSortInput | null;
  status?: ProjectPermissionsSyncJobStatus | null;
  /** Disable polling regardless of job activity (e.g. when the page is hidden). */
  disablePolling?: boolean;
}

interface UseProjectPermissionsSyncJobsResult {
  jobs: ProjectPermissionsSyncJob[];
  totalCount: number;
  hasNextPage: boolean;
  loading: boolean;
  polling: boolean;
  error: Error | undefined;
  hasActiveJob: boolean;
  refetch: (
    variables?: Partial<QueryProjectPermissionsSyncJobsArgs>
  ) => Promise<
    ApolloClient.QueryResult<{ projectPermissionsSyncJobs: ProjectPermissionsSyncJobPage }>
  >;
}

/**
 * Paginated query for project permission sync jobs. Polls every 5 seconds
 * while at least one job in the current page is `PENDING` or `RUNNING` so
 * the table reflects lifecycle transitions; stops polling when no active
 * jobs remain.
 */
export function useProjectPermissionsSyncJobs(
  params: UseProjectPermissionsSyncJobsParams
): UseProjectPermissionsSyncJobsResult {
  const { id, scope, page, limit, search, sort, status, disablePolling } = params;

  const skip = useMemo(() => !id || !scope || !scope.id || !scope.tenant, [id, scope]);

  const variables = useMemo<QueryProjectPermissionsSyncJobsArgs>(
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
    projectPermissionsSyncJobs: ProjectPermissionsSyncJobPage;
  }>(ProjectPermissionsSyncJobsDocument, {
    variables,
    skip,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const jobs = useMemo(() => data?.projectPermissionsSyncJobs?.jobs ?? [], [data]);
  const totalCount = data?.projectPermissionsSyncJobs?.totalCount ?? 0;
  const hasNextPage = data?.projectPermissionsSyncJobs?.hasNextPage ?? false;

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

interface UseProjectPermissionsSyncJobPayloadParams {
  id: string;
  scope: Scope | null | undefined;
  jobId: string | null | undefined;
}

interface UseProjectPermissionsSyncJobPayloadResult {
  payload: SyncProjectPermissionsInput | null;
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
export function useProjectPermissionsSyncJobPayload(
  params: UseProjectPermissionsSyncJobPayloadParams
): UseProjectPermissionsSyncJobPayloadResult {
  const { id, scope, jobId } = params;
  const [payload, setPayload] = useState<SyncProjectPermissionsInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const buildUrl = useCallback(() => {
    if (!id || !jobId || !scope || !scope.id || !scope.tenant) return null;
    const apiBase = getApiBaseUrl();
    const search = new URLSearchParams({ scopeId: scope.id, tenant: scope.tenant });
    return `${apiBase}/api/projects/${id}/permissions/sync-jobs/${jobId}/payload?${search.toString()}`;
  }, [id, scope, jobId]);

  const fetchPayload = useCallback(async (): Promise<SyncProjectPermissionsInput | null> => {
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
      const data = (await res.json()) as SyncProjectPermissionsInput;
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
    const importId = (content as { importId?: string | null }).importId ?? null;
    const filename = `cdm-${importId ?? jobId ?? 'payload'}.json`;
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

interface UseProjectPermissionsSyncJobSnapshotParams {
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

interface UseProjectPermissionsSyncJobSnapshotResult {
  snapshot: SyncProjectPermissionsInput | null;
  loading: boolean;
  error: Error | null;
  /** Triggers a browser download of the rollback snapshot JSON. */
  download: () => Promise<void>;
  reload: () => Promise<void>;
}

/**
 * Fetch the pre-sync rollback snapshot captured by the worker for a given
 * sync job. Mirrors {@link useProjectPermissionsSyncJobPayload} but hits the
 * `snapshot` REST endpoint. Returns `null` and sets `error` to a 404-shaped
 * value when the job has no snapshot.
 */
export function useProjectPermissionsSyncJobSnapshot(
  params: UseProjectPermissionsSyncJobSnapshotParams
): UseProjectPermissionsSyncJobSnapshotResult {
  const { id, scope, jobId, skip } = params;
  const [snapshot, setSnapshot] = useState<SyncProjectPermissionsInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const buildUrl = useCallback(() => {
    if (!id || !jobId || !scope || !scope.id || !scope.tenant) return null;
    const apiBase = getApiBaseUrl();
    const search = new URLSearchParams({ scopeId: scope.id, tenant: scope.tenant });
    return `${apiBase}/api/projects/${id}/permissions/sync-jobs/${jobId}/snapshot?${search.toString()}`;
  }, [id, scope, jobId]);

  const fetchSnapshot = useCallback(async (): Promise<SyncProjectPermissionsInput | null> => {
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
      const data = (await res.json()) as SyncProjectPermissionsInput;
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

interface UseExportProjectPermissionsParams {
  id: string;
  scope: Scope | null | undefined;
  /** Optional CDM version override; defaults to the only currently-supported value (1). */
  version?: number;
}

interface UseExportProjectPermissionsResult {
  loading: boolean;
  error: Error | null;
  /**
   * Snapshot the project's current state and trigger a browser save of the resulting CDM JSON.
   * Pass `undefined` or all sections for a full export (same as sync rollback snapshot).
   */
  exportProject: (
    sections?: readonly CdmExportSection[] | string
  ) => Promise<SyncProjectPermissionsInput | null>;
  reset: () => void;
}

/** `for...of` on a string iterates code units — never append query params that way. */
function coerceExportSectionsParam(
  sections?: readonly CdmExportSection[] | string | null
): readonly CdmExportSection[] | undefined {
  if (sections == null) return undefined;
  if (typeof sections === 'string') {
    const trimmed = sections.trim();
    if (trimmed === '') return undefined;
    return [trimmed as CdmExportSection];
  }
  return sections;
}

/**
 * Inverse operation of CDM permission sync: snapshots the project's current
 * permission/role/group/user-assignment state and packages it as a
 * download-friendly CDM JSON artifact via the REST export endpoint.
 *
 * Used by the toolbar / empty state to let an operator clone a project's
 * permission model or take a manual backup outside the worker's automatic
 * pre-sync snapshot.
 */
export function useExportProjectPermissions(
  params: UseExportProjectPermissionsParams
): UseExportProjectPermissionsResult {
  const { id, scope, version } = params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const exportProject = useCallback(
    async (
      sections?: readonly CdmExportSection[] | string
    ): Promise<SyncProjectPermissionsInput | null> => {
      if (!id || !scope || !scope.id || !scope.tenant) return null;
      setLoading(true);
      setError(null);
      try {
        const apiBase = getApiBaseUrl();
        const search = new URLSearchParams({ scopeId: scope.id, tenant: scope.tenant });
        if (version != null) {
          search.set('version', String(version));
        }
        const normalized = coerceExportSectionsParam(sections);
        const isFullExport =
          normalized == null ||
          normalized.length === 0 ||
          (normalized.length === CDM_EXPORT_SECTIONS.length &&
            CDM_EXPORT_SECTIONS.every((s) => normalized.includes(s)));
        if (!isFullExport && normalized != null) {
          for (const s of normalized) {
            search.append('sections', s);
          }
        }
        const url = `${apiBase}/api/projects/${id}/permissions/export?${search.toString()}`;
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
          throw new Error(bodyText || `Failed to export project (${res.status})`);
        }
        const data = (await res.json()) as SyncProjectPermissionsInput;
        if (typeof window !== 'undefined') {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const objectUrl = URL.createObjectURL(blob);
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `cdm-export-${id}-${timestamp}.json`;
          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(objectUrl);
        }
        return data;
      } catch (err) {
        const wrapped = err instanceof Error ? err : new Error(String(err));
        setError(wrapped);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [id, scope, version]
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { loading, error, exportProject, reset };
}
