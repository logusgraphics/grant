import { CreateRoleDialog } from './CreateRoleDialog';
import { RoleSorter } from './RoleSorter';
import { RoleLimit } from './RoleLimit';
import { RoleSearch } from './RoleSearch';
import { RoleViewSwitcher, RoleView } from './RoleViewSwitcher';
import { RoleSortableField, RoleSortOrder, RoleSortInput } from '@/graphql/generated/types';
import { useTranslations } from 'use-intl';

interface RoleToolbarProps {
  limit: number;
  search: string;
  sort?: RoleSortInput;
  currentView: RoleView;
  onLimitChange: (limit: number) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (field: RoleSortableField, order: RoleSortOrder) => void;
  onViewChange: (view: RoleView) => void;
}

export function RoleToolbar({
  limit,
  search,
  sort,
  currentView,
  onLimitChange,
  onSearchChange,
  onSortChange,
  onViewChange,
}: RoleToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-full sm:w-auto">
        <RoleSearch search={search} onSearchChange={onSearchChange} />
      </div>
      <div className="w-full sm:w-auto">
        <RoleSorter sort={sort} onSortChange={onSortChange} />
      </div>
      <div className="w-full sm:w-auto">
        <RoleLimit limit={limit} onLimitChange={onLimitChange} />
      </div>
      <div className="w-full sm:w-auto">
        <RoleViewSwitcher currentView={currentView} onViewChange={onViewChange} />
      </div>
      <div className="w-full sm:w-auto">
        <CreateRoleDialog />
      </div>
    </div>
  );
}
