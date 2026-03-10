'use client';

import { Pagination } from '@/components/common';
import { useApiKeysStore } from '@/stores/api-keys.store';

export function ApiKeyPagination() {
  const page = useApiKeysStore((state) => state.page);
  const limit = useApiKeysStore((state) => state.limit);
  const totalCount = useApiKeysStore((state) => state.totalCount);
  const setPage = useApiKeysStore((state) => state.setPage);
  const totalPages = Math.ceil(totalCount / limit);

  return <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />;
}
