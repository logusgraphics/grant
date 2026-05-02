'use client';

import { RefreshButton, Toolbar } from '@/components/common';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

import { PermissionSyncJobExportTrigger } from './permission-sync-job-export-trigger';
import { PermissionSyncJobLimit } from './permission-sync-job-limit';
import { PermissionSyncJobSearch } from './permission-sync-job-search';
import { PermissionSyncJobSorter } from './permission-sync-job-sorter';
import { PermissionSyncJobStartTrigger } from './permission-sync-job-start-trigger';
import { PermissionSyncJobStatusFilter } from './permission-sync-job-status-filter';
import { PermissionSyncJobViewSwitcher } from './permission-sync-job-view-switcher';

export function PermissionSyncJobToolbar() {
  const refetch = usePermissionSyncJobsStore((state) => state.refetch);
  const loading = usePermissionSyncJobsStore((state) => state.loading);

  const toolbarItems = [
    <RefreshButton key="refresh" onRefresh={refetch ?? undefined} loading={loading} />,
    <PermissionSyncJobSearch key="search" />,
    <PermissionSyncJobSorter key="sorter" />,
    <PermissionSyncJobStatusFilter key="status" />,
    <PermissionSyncJobLimit key="limit" />,
    <PermissionSyncJobViewSwitcher key="view" />,
    <PermissionSyncJobStartTrigger key="start" layout="toolbar" />,
    <PermissionSyncJobExportTrigger key="export" layout="toolbar" />,
  ];

  return <Toolbar items={toolbarItems} />;
}
