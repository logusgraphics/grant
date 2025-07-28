'use client';

import { Pagination } from '@/components/common';

interface GroupPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function GroupPagination({ currentPage, totalPages, onPageChange }: GroupPaginationProps) {
  return <Pagination page={currentPage} totalPages={totalPages} onPageChange={onPageChange} />;
}
