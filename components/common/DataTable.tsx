'use client';

import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading: boolean;
  search: string;
  emptyStateIcon: ReactNode;
  emptyStateTitle: string;
  emptyStateDescription: string;
  emptyStateAction?: ReactNode;
  loadingText: string;
  actionsColumn?: {
    render: (item: T) => ReactNode;
  };
}

export function DataTable<T>({
  data,
  columns,
  loading,
  search,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateAction,
  loadingText,
  actionsColumn,
}: DataTableProps<T>) {
  const hasData = data.length > 0;
  const showEmptyState = !hasData && !loading;

  return (
    <div className="w-full px-4">
      <div className="space-y-4">
        {showEmptyState ? (
          <EmptyState
            icon={emptyStateIcon}
            title={emptyStateTitle}
            description={emptyStateDescription}
            action={emptyStateAction}
          />
        ) : (
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key} className={column.className}>
                      {column.header}
                    </TableHead>
                  ))}
                  {actionsColumn && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (actionsColumn ? 1 : 0)}
                      className="text-center py-8"
                    >
                      {loadingText}
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item, index) => (
                    <TableRow key={index}>
                      {columns.map((column) => (
                        <TableCell key={column.key} className={column.className}>
                          {column.render(item)}
                        </TableCell>
                      ))}
                      {actionsColumn && <TableCell>{actionsColumn.render(item)}</TableCell>}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
