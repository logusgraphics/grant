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
import { ColoredList } from '@/components/ui/colored-list';
import { cn } from '@/lib/utils';
import { CopyToClipboard } from './CopyToClipboard';

// Field renderer types
export type FieldType =
  | 'text'
  | 'avatar'
  | 'list'
  | 'date'
  | 'timestamp'
  | 'email'
  | 'description'
  | 'id';

// Avatar configuration
export interface AvatarConfig<T> {
  getInitial: (item: T) => string;
  getBackgroundClass?: (item: T) => string;
  defaultBackgroundClass?: string;
  size?: 'sm' | 'md' | 'lg';
}

// List configuration
export interface ListConfig<T> {
  items: (item: T) => any[];
  labelField: string;
  icon?: ReactNode;
  height?: number;
  maxItems?: number;
}

// Date configuration
export interface DateConfig {
  format?: 'short' | 'long' | 'date-only' | 'time-only';
  showTime?: boolean;
}

// Field configuration
export interface FieldConfig<T> {
  type: FieldType;
  key: string;
  header: string;
  className?: string;
  width?: string;

  // Type-specific configurations
  avatar?: AvatarConfig<T>;
  list?: ListConfig<T>;
  date?: DateConfig;

  // Custom renderer (overrides type-specific rendering)
  render?: (item: T) => ReactNode;
}

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
  width?: string;
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

// Enhanced DataTable with field configurations
export interface EnhancedDataTableProps<T> {
  data: T[];
  fields: FieldConfig<T>[];
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

// Field renderer functions
function renderAvatar<T>(item: T, config: AvatarConfig<T>) {
  const size = config.size || 'md';
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  const getBackground = (item: T) => {
    return config.getBackgroundClass?.(item) || config.defaultBackgroundClass || 'bg-primary/10';
  };

  return (
    <div className={cn('flex items-center gap-3')}>
      <div
        className={cn(
          'shrink-0 rounded-full flex items-center justify-center font-medium',
          sizeClasses[size],
          getBackground(item)
        )}
      >
        <span className="text-primary font-semibold">{config.getInitial(item)}</span>
      </div>
      <span className="font-medium truncate">{(item as any).name}</span>
    </div>
  );
}

function renderList<T>(item: T, config: ListConfig<T>) {
  const items = config.items(item);

  return (
    <ColoredList
      items={items}
      labelField={config.labelField}
      title=""
      icon={config.icon}
      height={config.height || 60}
    />
  );
}

function renderDate<T>(item: T, config: DateConfig, value: string) {
  const date = new Date(value);

  const formatDate = () => {
    switch (config.format) {
      case 'short':
        return date.toLocaleDateString();
      case 'long':
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'date-only':
        return date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      case 'time-only':
        return date.toLocaleTimeString();
      default:
        return date.toLocaleDateString();
    }
  };

  return <span className="text-sm text-muted-foreground">{formatDate()}</span>;
}

function renderTimestamp<T>(item: T, value: string) {
  const date = new Date(value);
  return <span className="text-sm text-muted-foreground">{date.toLocaleString()}</span>;
}

function renderEmail<T>(item: T, value: string) {
  return (
    <a href={`mailto:${value}`} className="text-sm text-primary hover:underline">
      {value}
    </a>
  );
}

function renderDescription<T>(item: T, value: string | null | undefined) {
  if (!value) {
    return <span className="text-sm text-muted-foreground italic">No description</span>;
  }

  return <span className="text-sm text-muted-foreground line-clamp-2">{value}</span>;
}

// Enhanced DataTable component
export function EnhancedDataTable<T>({
  data,
  fields,
  loading,
  emptyState,
  actionsColumn,
  skeletonConfig,
}: EnhancedDataTableProps<T>) {
  const hasData = data.length > 0;
  const showEmptyState = !hasData && !loading;

  // Convert fields to columns
  const columns: TableColumn<T>[] = fields.map((field) => ({
    key: field.key,
    header: field.header,
    className: field.className,
    width: field.width,
    render: (item: T) => {
      // Use custom renderer if provided
      if (field.render) {
        return field.render(item);
      }

      // Use type-specific renderer
      const value = (item as any)[field.key];

      switch (field.type) {
        case 'avatar':
          return field.avatar ? renderAvatar(item, field.avatar) : <span>{value}</span>;
        case 'list':
          return field.list ? renderList(item, field.list) : <span>{value}</span>;
        case 'date':
          return field.date ? renderDate(item, field.date, value) : <span>{value}</span>;
        case 'timestamp':
          return renderTimestamp(item, value);
        case 'email':
          return renderEmail(item, value);
        case 'description':
          return renderDescription(item, value);
        case 'id':
          return (
            <div className="flex items-center gap-2">
              <CopyToClipboard text={value} />
              <span className="text-sm text-muted-foreground truncate max-w-[80px]" title={value}>
                {value.length > 8 ? `${value.substring(0, 8)}...` : value}
              </span>
            </div>
          );
        case 'text':
        default:
          return <span>{value}</span>;
      }
    },
  }));

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
                    <TableHead
                      key={column.key}
                      className={column.className}
                      style={{ width: column.width }}
                    >
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

// Original DataTable component (kept for backward compatibility)
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
