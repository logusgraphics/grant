'use client';

import { Pagination } from '@/components/common';
import { useProjectSyncJobsStore } from '@/stores/project-sync-jobs.store';

export function ProjectSyncJobPagination() {
  const page = useProjectSyncJobsStore((state) => state.page);
  const limit = useProjectSyncJobsStore((state) => state.limit);
  const totalCount = useProjectSyncJobsStore((state) => state.totalCount);
  const setPage = useProjectSyncJobsStore((state) => state.setPage);
  const totalPages = Math.ceil(totalCount / limit);

  return <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />;
}
