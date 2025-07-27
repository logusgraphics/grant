'use client';

import { User, UserSortableField, UserSortOrder } from '@/graphql/generated/types';
import { UserCards } from './UserCards';
import { UserTable } from './UserTable';
import { UserView } from './UserViewSwitcher';

interface UserViewerProps {
  limit: number;
  users: User[];
  loading: boolean;
  search: string;
  view: UserView;
  onEditClick: (user: User) => void;
  onDeleteClick: (user: User) => void;
}

export function UserViewer({
  limit,
  users,
  loading,
  search,
  view,
  onEditClick,
  onDeleteClick,
}: UserViewerProps) {
  const props = {
    limit,
    users,
    loading,
    search,
    onEditClick,
    onDeleteClick,
  };

  return view === 'card' ? <UserCards {...props} /> : <UserTable {...props} />;
}
