import { CreateGroupDialog } from './CreateGroupDialog';
import { GroupSorter } from './GroupSorter';
import { GroupLimit } from './GroupLimit';
import { GroupSearch } from './GroupSearch';
import { GroupViewSwitcher, GroupView } from './GroupViewSwitcher';
import { GroupSortableField, GroupSortOrder, GroupSortInput } from '@/graphql/generated/types';
import { Toolbar } from '@/components/common';

interface GroupToolbarProps {
  limit: number;
  search: string;
  sort?: GroupSortInput;
  currentView: GroupView;
  onLimitChange: (limit: number) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (field: GroupSortableField, order: GroupSortOrder) => void;
  onViewChange: (view: GroupView) => void;
}

export function GroupToolbar({
  limit,
  search,
  sort,
  currentView,
  onLimitChange,
  onSearchChange,
  onSortChange,
  onViewChange,
}: GroupToolbarProps) {
  const toolbarItems = [
    <GroupSearch key="search" search={search} onSearchChange={onSearchChange} />,
    <GroupSorter key="sorter" sort={sort} onSortChange={onSortChange} />,
    <GroupLimit key="limit" limit={limit} onLimitChange={onLimitChange} />,
    <GroupViewSwitcher key="view" currentView={currentView} onViewChange={onViewChange} />,
    <CreateGroupDialog key="create" />,
  ];

  return <Toolbar items={toolbarItems} />;
}
