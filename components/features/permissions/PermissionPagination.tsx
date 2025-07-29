import { Pagination } from '@/components/common';

interface PermissionPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PermissionPagination({
  page,
  totalPages,
  onPageChange,
}: PermissionPaginationProps) {
  return <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />;
}
