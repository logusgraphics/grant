import { Toolbar } from '@/components/common';
import { GroupSortableField, GroupSortOrder, GroupSortInput } from '@/graphql/generated/types';

import { CreateGroupDialog } from './CreateGroupDialog';
import { GroupLimit } from './GroupLimit';
import { GroupSearch } from './GroupSearch';
import { GroupSorter } from './GroupSorter';
import { GroupTagSelector } from './GroupTagSelector';
import { GroupViewSwitcher, GroupView } from './GroupViewSwitcher';

interface GroupToolbarProps {
  limit: number;
  search: string;
  sort?: GroupSortInput;
  currentView: GroupView;
  selectedTagIds: string[];
  onLimitChange: (limit: number) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (field: GroupSortableField, order: GroupSortOrder) => void;
  onViewChange: (view: GroupView) => void;
  onTagIdsChange: (tagIds: string[]) => void;
}

export function GroupToolbar({
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
}: GroupToolbarProps) {
  const toolbarItems = [
    <GroupSearch key="search" search={search} onSearchChange={onSearchChange} />,
    <GroupSorter key="sorter" sort={sort} onSortChange={onSortChange} />,
    <GroupTagSelector key="tags" selectedTagIds={selectedTagIds} onTagIdsChange={onTagIdsChange} />,
    <GroupLimit key="limit" limit={limit} onLimitChange={onLimitChange} />,
    <GroupViewSwitcher key="view" currentView={currentView} onViewChange={onViewChange} />,
    <CreateGroupDialog key="create" />,
  ];

  return <Toolbar items={toolbarItems} />;
}
