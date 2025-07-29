'use client';

import { Permission } from '@/graphql/generated/types';

import { PermissionCards } from './PermissionCards';
import { PermissionTable } from './PermissionTable';
import { PermissionView } from './PermissionViewSwitcher';

interface PermissionViewerProps {
  limit: number;
  permissions: Permission[];
  loading: boolean;
  search: string;
  view: PermissionView;
  onEditClick: (permission: Permission) => void;
  onDeleteClick: (permission: Permission) => void;
}

export function PermissionViewer({ view, ...props }: PermissionViewerProps) {
  switch (view) {
    case PermissionView.CARD:
      return <PermissionCards {...props} />;
    case PermissionView.TABLE:
    default:
      return <PermissionTable {...props} />;
  }
}
