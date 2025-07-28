import { Pagination } from '@/components/common';

interface UserPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function UserPagination({ page, totalPages, onPageChange }: UserPaginationProps) {
  return <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />;
}
