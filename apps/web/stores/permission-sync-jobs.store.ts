import {
  ProjectSyncJob,
  ProjectSyncJobSortableField,
  ProjectSyncJobStatus,
  SortOrder,
} from '@grantjs/schema';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  PermissionSyncJobStatusFilterValue,
  PermissionSyncJobView,
} from '@/components/features/permission-sync-jobs/permission-sync-job-types';

interface PermissionSyncJobsState {
  // Filters / pagination
  page: number;
  limit: number;
  search: string;
  sort: { field: ProjectSyncJobSortableField; order: SortOrder };
  status: PermissionSyncJobStatusFilterValue;
  view: PermissionSyncJobView;

  // Data
  jobs: ProjectSyncJob[];
  totalCount: number;
  loading: boolean;
  refetch: (() => void | Promise<unknown>) | null;

  // Dialog state
  isStartDialogOpen: boolean;
  isExportDialogOpen: boolean;
  jobToView: ProjectSyncJob | null;
  jobToCancel: ProjectSyncJob | null;

  // Actions
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setSort: (field: ProjectSyncJobSortableField, order: SortOrder) => void;
  setStatus: (status: PermissionSyncJobStatusFilterValue) => void;
  setView: (view: PermissionSyncJobView) => void;
  setJobs: (jobs: ProjectSyncJob[]) => void;
  /** Prepends a job when absent (e.g. right after enqueue, before list refetch settles). */
  prependJob: (job: ProjectSyncJob) => void;
  setTotalCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setRefetch: (refetch: (() => void | Promise<unknown>) | null) => void;

  setStartDialogOpen: (open: boolean) => void;
  setExportDialogOpen: (open: boolean) => void;
  setJobToView: (job: ProjectSyncJob | null) => void;
  setJobToCancel: (job: ProjectSyncJob | null) => void;

  resetToDefaults: () => void;
}

const defaultSort = {
  field: ProjectSyncJobSortableField.EnqueuedAt,
  order: SortOrder.Desc,
};

const initialState = {
  page: 1,
  limit: 25,
  search: '',
  sort: defaultSort,
  status: null as PermissionSyncJobStatusFilterValue,
  view: PermissionSyncJobView.TABLE,
  jobs: [] as ProjectSyncJob[],
  totalCount: 0,
  loading: false,
  refetch: null as (() => void) | null,
  isStartDialogOpen: false,
  isExportDialogOpen: false,
  jobToView: null as ProjectSyncJob | null,
  jobToCancel: null as ProjectSyncJob | null,
};

export const usePermissionSyncJobsStore = create<PermissionSyncJobsState>()(
  devtools(
    (set) => ({
      ...initialState,

      setPage: (page) => set({ page }),
      setLimit: (limit) => set({ limit, page: 1 }),
      setSearch: (search) => set({ search, page: 1 }),
      setSort: (field, order) => set({ sort: { field, order }, page: 1 }),
      setStatus: (status) => set({ status, page: 1 }),
      setView: (view) => set({ view }),
      setJobs: (jobs) => set({ jobs }),
      prependJob: (job) =>
        set((state) => {
          if (state.jobs.some((existing) => existing.id === job.id)) {
            return state;
          }
          return { jobs: [job, ...state.jobs], totalCount: state.totalCount + 1 };
        }),
      setTotalCount: (totalCount) => set({ totalCount }),
      setLoading: (loading) => set({ loading }),
      setRefetch: (refetch) => set({ refetch }),

      setStartDialogOpen: (isStartDialogOpen) => set({ isStartDialogOpen }),
      setExportDialogOpen: (isExportDialogOpen) => set({ isExportDialogOpen }),
      setJobToView: (jobToView) => set({ jobToView }),
      setJobToCancel: (jobToCancel) => set({ jobToCancel }),

      resetToDefaults: () => set({ ...initialState }),
    }),
    { name: 'grant-permission-sync-jobs-store' }
  )
);

export const PERMISSION_SYNC_JOB_STATUS_FILTERS: ReadonlyArray<{
  value: PermissionSyncJobStatusFilterValue;
  labelKey: string;
}> = [
  { value: null, labelKey: 'status.all' },
  { value: ProjectSyncJobStatus.Pending, labelKey: 'status.pending' },
  { value: ProjectSyncJobStatus.Running, labelKey: 'status.running' },
  { value: ProjectSyncJobStatus.Completed, labelKey: 'status.completed' },
  { value: ProjectSyncJobStatus.Failed, labelKey: 'status.failed' },
  { value: ProjectSyncJobStatus.Cancelled, labelKey: 'status.cancelled' },
];
