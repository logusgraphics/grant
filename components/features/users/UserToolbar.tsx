import { Toolbar } from '@/components/common';
import { UserSortableField, UserSortOrder, UserSortInput } from '@/graphql/generated/types';

import { CreateUserDialog } from './CreateUserDialog';
import { UserLimit } from './UserLimit';
import { UserSearch } from './UserSearch';
import { UserSorter } from './UserSorter';
import { UserTagSelector } from './UserTagSelector';
import { UserViewSwitcher, UserView } from './UserViewSwitcher';

interface UserToolbarProps {
  limit: number;
  search: string;
  sort?: UserSortInput;
  currentView: UserView;
  selectedTagIds: string[];
  onLimitChange: (limit: number) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (field: UserSortableField, order: UserSortOrder) => void;
  onViewChange: (view: UserView) => void;
  onTagIdsChange: (tagIds: string[]) => void;
}

export function UserToolbar({
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
}: UserToolbarProps) {
  const toolbarItems = [
    <UserSearch key="search" search={search} onSearchChange={onSearchChange} />,
    <UserSorter key="sorter" sort={sort} onSortChange={onSortChange} />,
    <UserTagSelector key="tags" selectedTagIds={selectedTagIds} onTagIdsChange={onTagIdsChange} />,
    <UserLimit key="limit" limit={limit} onLimitChange={onLimitChange} />,
    <UserViewSwitcher key="view" currentView={currentView} onViewChange={onViewChange} />,
    <CreateUserDialog key="create" />,
  ];

  return <Toolbar items={toolbarItems} />;
}
