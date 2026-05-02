'use client';

import { Pagination } from '@/components/common';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

export function PermissionSyncJobPagination() {
  const page = usePermissionSyncJobsStore((state) => state.page);
  const limit = usePermissionSyncJobsStore((state) => state.limit);
  const totalCount = usePermissionSyncJobsStore((state) => state.totalCount);
  const setPage = usePermissionSyncJobsStore((state) => state.setPage);
  const totalPages = Math.ceil(totalCount / limit);

  return <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />;
}
