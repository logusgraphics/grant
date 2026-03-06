'use client';

import { Pagination } from '@/components/common';
import { useProjectAppsStore } from '@/stores/project-apps.store';

export function ProjectAppPagination() {
  const page = useProjectAppsStore((state) => state.page);
  const limit = useProjectAppsStore((state) => state.limit);
  const totalCount = useProjectAppsStore((state) => state.totalCount);
  const setPage = useProjectAppsStore((state) => state.setPage);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />;
}
