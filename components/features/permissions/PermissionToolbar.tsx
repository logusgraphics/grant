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
import { PermissionTagSelector } from './PermissionTagSelector';
import { PermissionViewSwitcher, PermissionView } from './PermissionViewSwitcher';

interface PermissionToolbarProps {
  limit: number;
  search: string;
  sort?: PermissionSortInput;
  currentView: PermissionView;
  selectedTagIds: string[];
  onLimitChange: (limit: number) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (field: PermissionSortableField, order: PermissionSortOrder) => void;
  onViewChange: (view: PermissionView) => void;
  onTagIdsChange: (tagIds: string[]) => void;
}

export function PermissionToolbar({
  limit,
  search,
  sort,
  currentView,
  selectedTagIds,
  onLimitChange,
  onSearchChange,
  onSortChange,
  onViewChange,
  onTagIdsChange,
}: PermissionToolbarProps) {
  const toolbarItems = [
    <PermissionSearch key="search" search={search} onSearchChange={onSearchChange} />,
    <PermissionSorter key="sorter" sort={sort} onSortChange={onSortChange} />,
    <PermissionTagSelector
      key="tags"
      selectedTagIds={selectedTagIds}
      onTagIdsChange={onTagIdsChange}
    />,
    <PermissionLimit key="limit" limit={limit} onLimitChange={onLimitChange} />,
    <PermissionViewSwitcher key="view" currentView={currentView} onViewChange={onViewChange} />,
    <CreatePermissionDialog key="create" />,
  ];

  return <Toolbar items={toolbarItems} />;
}
