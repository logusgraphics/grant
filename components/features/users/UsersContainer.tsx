'use client';

import { useMutation } from '@apollo/client';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { User, UserSortableField, UserSortOrder } from '@/graphql/generated/types';
import { evictUsersCache } from './cache';
import { DELETE_USER } from './mutations';
import { useTranslations } from 'next-intl';
import { useUsers } from '@/hooks/useUsers';

interface UsersContainerProps {
  page: number;
  limit: number;
  search: string;
  sort?: {
    field: UserSortableField;
    order: UserSortOrder;
  };
  onTotalCountChange?: (totalCount: number) => void;
  children: (props: {
    limit: number;
    users: User[];
    loading: boolean;
    onEditClick: (user: User) => void;
    onDeleteClick: (user: User) => void;
    userToDelete: { id: string; name: string } | null;
    userToEdit: User | null;
    onDeleteConfirm: () => Promise<void>;
    onDeleteCancel: () => void;
    onEditClose: () => void;
    currentPage: number;
  }) => React.ReactNode;
}

export function UsersContainer({
  page,
  limit,
  search,
  sort,
  onTotalCountChange,
  children,
}: UsersContainerProps) {
  const { users, loading, error, totalCount, refetch } = useUsers({
    page,
    limit,
    search,
    sort,
  });

  const [deleteUser] = useMutation<{
    deleteUser: User;
  }>(DELETE_USER, {
    update(cache) {
      evictUsersCache(cache);
      cache.gc();
    },
  });

  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const t = useTranslations('users');

  // Update parent with total count when data changes
  useEffect(() => {
    if (totalCount) {
      onTotalCountChange?.(totalCount);
    }
  }, [totalCount, onTotalCountChange]);

  const handleDelete = useCallback(async () => {
    if (!userToDelete) return;

    try {
      await deleteUser({
        variables: { id: userToDelete.id },
      });
      toast.success(t('notifications.deleteSuccess'), {
        description: `${userToDelete.name} has been removed from the system`,
      });

      // Refetch the current page to get the updated list
      await refetch();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('notifications.deleteError'), {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setUserToDelete(null);
    }
  }, [userToDelete, deleteUser, refetch, t]);

  const handleEditClick = useCallback((user: User) => {
    setUserToEdit(user);
  }, []);

  const handleDeleteClick = useCallback((user: User) => {
    setUserToDelete({ id: user.id, name: user.name });
  }, []);

  if (error) return <div>Error: {error.message}</div>;
  if (!users.length && !loading) return null;

  return children({
    limit,
    users,
    loading,
    onEditClick: handleEditClick,
    onDeleteClick: handleDeleteClick,
    userToDelete,
    userToEdit,
    onDeleteConfirm: handleDelete,
    onDeleteCancel: () => setUserToDelete(null),
    onEditClose: () => setUserToEdit(null),
    currentPage: page,
  });
}
