'use client';

import { Role, RoleSortableField, RoleSortOrder } from '@/graphql/generated/types';
import { RoleCards } from './RoleCards';
import { RoleTable } from './RoleTable';
import { RoleView } from './RoleViewSwitcher';

interface RoleViewerProps {
  limit: number;
  roles: Role[];
  loading: boolean;
  search: string;
  view: RoleView;
  onEditClick: (role: Role) => void;
  onDeleteClick: (role: Role) => void;
}

export function RoleViewer({
  limit,
  roles,
  loading,
  search,
  view,
  onEditClick,
  onDeleteClick,
}: RoleViewerProps) {
  const props = {
    limit,
    roles,
    loading,
    search,
    onEditClick,
    onDeleteClick,
  };

  return view === 'card' ? <RoleCards {...props} /> : <RoleTable {...props} />;
}
