'use client';

import { useEffect } from 'react';

import { useUsers } from '@/hooks/users';
import { useUsersStore } from '@/stores/users.store';

import { UserCards } from './UserCards';
import { UserTable } from './UserTable';
import { UserView } from './UserViewSwitcher';

export function UserViewer() {
  // Use selective subscriptions to prevent unnecessary re-renders
  const view = useUsersStore((state) => state.view);
  const limit = useUsersStore((state) => state.limit);
  const search = useUsersStore((state) => state.search);
  const page = useUsersStore((state) => state.page);
  const sort = useUsersStore((state) => state.sort);
  const selectedTagIds = useUsersStore((state) => state.selectedTagIds);
  const setTotalCount = useUsersStore((state) => state.setTotalCount);

  // Get users data from the hook
  const { users, loading, totalCount, refetch } = useUsers({
    page,
    limit,
    search,
    sort,
    tagIds: selectedTagIds,
  });

  // Update store with total count when data changes
  useEffect(() => {
    if (totalCount && totalCount !== 0) {
      setTotalCount(totalCount);
    }
  }, [totalCount, setTotalCount]);

  switch (view) {
    case UserView.CARD:
      return <UserCards limit={limit} users={users} loading={loading} search={search} />;
    case UserView.TABLE:
    default:
      return <UserTable limit={limit} users={users} loading={loading} search={search} />;
  }
}
