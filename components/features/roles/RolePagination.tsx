import { Pagination } from '@/components/common';

interface RolePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function RolePagination({ page, totalPages, onPageChange }: RolePaginationProps) {
  return <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />;
}
