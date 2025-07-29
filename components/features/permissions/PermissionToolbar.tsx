import { Toolbar } from '@/components/common';
import {
  PermissionSortableField,
  PermissionSortOrder,
  PermissionSortInput,
} from '@/graphql/generated/types';

import { CreatePermissionDialog } from './CreatePermissionDialog';
import { PermissionLimit } from './PermissionLimit';
import { PermissionSearch } from './PermissionSearch';
import { PermissionSorter } from './PermissionSorter';
import { PermissionViewSwitcher, PermissionView } from './PermissionViewSwitcher';

interface PermissionToolbarProps {
  limit: number;
  search: string;
  sort?: PermissionSortInput;
  currentView: PermissionView;
  onLimitChange: (limit: number) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (field: PermissionSortableField, order: PermissionSortOrder) => void;
  onViewChange: (view: PermissionView) => void;
}

export function PermissionToolbar({
  limit,
  search,
  sort,
  currentView,
  onLimitChange,
  onSearchChange,
  onSortChange,
  onViewChange,
}: PermissionToolbarProps) {
  const toolbarItems = [
    <PermissionSearch key="search" search={search} onSearchChange={onSearchChange} />,
    <PermissionSorter key="sorter" sort={sort} onSortChange={onSortChange} />,
    <PermissionLimit key="limit" limit={limit} onLimitChange={onLimitChange} />,
    <PermissionViewSwitcher key="view" currentView={currentView} onViewChange={onViewChange} />,
    <CreatePermissionDialog key="create" />,
  ];

  return <Toolbar items={toolbarItems} />;
}
