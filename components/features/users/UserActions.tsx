import { CreateUserDialog } from './CreateUserDialog';
import { UserSorter } from './UserSorter';
import { UserLimit } from './UserLimit';
import { UserSortableField, UserSortOrder } from '@/graphql/generated/types';

interface UserActionsProps {
  currentPage: number;
  currentLimit: number;
  currentSort?: {
    field: UserSortableField;
    order: UserSortOrder;
  };
  onSortChange: (field: UserSortableField, order: UserSortOrder) => void;
  onLimitChange: (limit: number) => void;
}

export function UserActions({
  currentPage,
  currentLimit,
  currentSort,
  onSortChange,
  onLimitChange,
}: UserActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <UserSorter currentSort={currentSort} onSortChange={onSortChange} />
      <UserLimit limit={currentLimit} onLimitChange={onLimitChange} />
      <CreateUserDialog currentPage={currentPage} />
      {/* Add more user actions here as needed */}
    </div>
  );
}
