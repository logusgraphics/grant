import {
  ProjectPermissionsSyncJob,
  ProjectPermissionsSyncJobSortableField,
  ProjectPermissionsSyncJobStatus,
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
  sort: { field: ProjectPermissionsSyncJobSortableField; order: SortOrder };
  status: PermissionSyncJobStatusFilterValue;
  view: PermissionSyncJobView;

  // Data
  jobs: ProjectPermissionsSyncJob[];
  totalCount: number;
  loading: boolean;
  refetch: (() => void) | null;

  // Dialog state
  isStartDialogOpen: boolean;
  isExportDialogOpen: boolean;
  jobToView: ProjectPermissionsSyncJob | null;
  jobToCancel: ProjectPermissionsSyncJob | null;

  // Actions
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setSort: (field: ProjectPermissionsSyncJobSortableField, order: SortOrder) => void;
  setStatus: (status: PermissionSyncJobStatusFilterValue) => void;
  setView: (view: PermissionSyncJobView) => void;
  setJobs: (jobs: ProjectPermissionsSyncJob[]) => void;
  setTotalCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setRefetch: (refetch: (() => void) | null) => void;

  setStartDialogOpen: (open: boolean) => void;
  setExportDialogOpen: (open: boolean) => void;
  setJobToView: (job: ProjectPermissionsSyncJob | null) => void;
  setJobToCancel: (job: ProjectPermissionsSyncJob | null) => void;

  resetToDefaults: () => void;
}

const defaultSort = {
  field: ProjectPermissionsSyncJobSortableField.EnqueuedAt,
  order: SortOrder.Desc,
};

const initialState = {
  page: 1,
  limit: 25,
  search: '',
  sort: defaultSort,
  status: null as PermissionSyncJobStatusFilterValue,
  view: PermissionSyncJobView.TABLE,
  jobs: [] as ProjectPermissionsSyncJob[],
  totalCount: 0,
  loading: false,
  refetch: null as (() => void) | null,
  isStartDialogOpen: false,
  isExportDialogOpen: false,
  jobToView: null as ProjectPermissionsSyncJob | null,
  jobToCancel: null as ProjectPermissionsSyncJob | null,
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
  { value: ProjectPermissionsSyncJobStatus.Pending, labelKey: 'status.pending' },
  { value: ProjectPermissionsSyncJobStatus.Running, labelKey: 'status.running' },
  { value: ProjectPermissionsSyncJobStatus.Completed, labelKey: 'status.completed' },
  { value: ProjectPermissionsSyncJobStatus.Failed, labelKey: 'status.failed' },
  { value: ProjectPermissionsSyncJobStatus.Cancelled, labelKey: 'status.cancelled' },
];
