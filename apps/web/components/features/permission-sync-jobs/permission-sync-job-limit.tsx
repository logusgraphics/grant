'use client';

import { Limit } from '@/components/common';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

export function PermissionSyncJobLimit() {
  const limit = usePermissionSyncJobsStore((state) => state.limit);
  const setLimit = usePermissionSyncJobsStore((state) => state.setLimit);

  return (
    <Limit
      limit={limit}
      onLimitChange={setLimit}
      namespace="permissionSyncJobs"
      translationKey="limit.label"
    />
  );
}
