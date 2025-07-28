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
import { TableSkeleton, type ColumnConfig } from './TableSkeleton';

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

export interface EmptyStateConfig {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading: boolean;
  emptyState: EmptyStateConfig;
  actionsColumn?: {
    render: (item: T) => ReactNode;
  };
  skeletonConfig?: {
    columns: ColumnConfig[];
    rowCount?: number;
  };
}

export function DataTable<T>({
  data,
  columns,
  loading,
  emptyState,
  actionsColumn,
  skeletonConfig,
}: DataTableProps<T>) {
  const hasData = data.length > 0;
  const showEmptyState = !hasData && !loading;

  // If loading and we have skeleton config, show skeleton
  if (loading && skeletonConfig) {
    return (
      <TableSkeleton
        columns={skeletonConfig.columns}
        rowCount={skeletonConfig.rowCount || 5}
        showActions={!!actionsColumn}
      />
    );
  }

  return (
    <div className="w-full px-4">
      <div className="space-y-4">
        {showEmptyState ? (
          <EmptyState
            icon={emptyState.icon}
            title={emptyState.title}
            description={emptyState.description}
            action={emptyState.action}
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
                {data.map((item, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.render(item)}
                      </TableCell>
                    ))}
                    {actionsColumn && <TableCell>{actionsColumn.render(item)}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
