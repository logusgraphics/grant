import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ApolloCache, NetworkStatus } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  CancelProjectPermissionsSyncDocument,
  ProjectPermissionsSyncJob,
  ProjectPermissionsSyncJobDocument,
  ProjectPermissionsSyncJobStatus,
  Scope,
  StartProjectPermissionsSyncDocument,
  SyncProjectPermissionsInput,
} from '@grantjs/schema';

import { evictGroupsCache } from '../groups/cache';
import { evictPermissionsCache } from '../permissions/cache';
import { evictRolesCache } from '../roles/cache';

const TERMINAL_STATUSES: ReadonlyArray<ProjectPermissionsSyncJobStatus> = [
  ProjectPermissionsSyncJobStatus.Completed,
  ProjectPermissionsSyncJobStatus.Failed,
  ProjectPermissionsSyncJobStatus.Cancelled,
];

const DEFAULT_POLL_INTERVAL_MS = 2000;

function isTerminalStatus(status: ProjectPermissionsSyncJobStatus | undefined): boolean {
  return status != null && TERMINAL_STATUSES.includes(status);
}

function evictAffectedCaches(cache: ApolloCache) {
  evictPermissionsCache(cache);
  evictRolesCache(cache);
  evictGroupsCache(cache);
}

/**
 * Mutation hook to enqueue an async CDM permission sync.
 * Returns the persisted job row including its id and current status.
 */
export function useStartProjectPermissionsSync() {
  const [start, state] = useMutation<{ startProjectPermissionsSync: ProjectPermissionsSyncJob }>(
    StartProjectPermissionsSyncDocument
  );

  const startSync = useCallback(
    async (params: { id: string; scope: Scope; input: SyncProjectPermissionsInput }) => {
      const { id, scope, input } = params;
      const result = await start({ variables: { id, scope, input } });
      return result.data?.startProjectPermissionsSync;
    },
    [start]
  );

  return {
    startSync,
    loading: state.loading,
    error: state.error,
    job: state.data?.startProjectPermissionsSync,
    reset: state.reset,
  };
}

export interface UseProjectPermissionsSyncJobParams {
  id: string;
  scope: Scope | undefined;
  jobId: string | undefined;
  /**
   * How often to refetch while the job is in PENDING/RUNNING. Defaults to 2s.
   * Set to 0 to disable polling.
   */
  pollIntervalMs?: number;
  /** Set true to skip the query (e.g. before the job is started). */
  skip?: boolean;
}

/**
 * Query hook that polls the status of an async sync job. Polling stops
 * automatically once the job reaches a terminal status (completed, failed,
 * or cancelled). On completion, scope-related Apollo caches are evicted so
 * downstream queries refetch fresh data.
 */
export function useProjectPermissionsSyncJob(params: UseProjectPermissionsSyncJobParams) {
  const { id, scope, jobId, pollIntervalMs = DEFAULT_POLL_INTERVAL_MS, skip: skipParam } = params;

  const skip = useMemo(
    () => skipParam === true || !id || !jobId || !scope || !scope.id || !scope.tenant,
    [skipParam, id, jobId, scope]
  );

  const { data, loading, error, networkStatus, refetch, startPolling, stopPolling, client } =
    useQuery(ProjectPermissionsSyncJobDocument, {
      variables: { id, scope: scope ?? ({} as Scope), jobId: jobId ?? '' },
      skip,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
      pollInterval: pollIntervalMs > 0 ? pollIntervalMs : 0,
    });

  const job = data?.projectPermissionsSyncJob as ProjectPermissionsSyncJob | undefined;
  const status = job?.status;
  const isTerminal = isTerminalStatus(status);
  const isActive =
    status === ProjectPermissionsSyncJobStatus.Pending ||
    status === ProjectPermissionsSyncJobStatus.Running;

  const evictedJobIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!job) return;
    if (
      status === ProjectPermissionsSyncJobStatus.Completed &&
      evictedJobIdRef.current !== job.id
    ) {
      evictAffectedCaches(client.cache);
      evictedJobIdRef.current = job.id;
    }
    if (isTerminal) {
      stopPolling();
    }
  }, [job, status, isTerminal, client, stopPolling]);

  return {
    job,
    loading: loading && networkStatus !== NetworkStatus.poll,
    polling: networkStatus === NetworkStatus.poll,
    error,
    isTerminal,
    isActive,
    refetch,
    startPolling,
    stopPolling,
  };
}

/** Mutation hook to cancel an in-flight sync job (best-effort once RUNNING). */
export function useCancelProjectPermissionsSync() {
  const [cancel, state] = useMutation<{ cancelProjectPermissionsSync: ProjectPermissionsSyncJob }>(
    CancelProjectPermissionsSyncDocument
  );

  const cancelSync = useCallback(
    async (params: { id: string; scope: Scope; jobId: string }) => {
      const result = await cancel({ variables: params });
      return result.data?.cancelProjectPermissionsSync;
    },
    [cancel]
  );

  return {
    cancelSync,
    loading: state.loading,
    error: state.error,
    reset: state.reset,
  };
}
