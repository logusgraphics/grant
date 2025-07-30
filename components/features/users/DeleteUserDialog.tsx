'use client';

import { DeleteDialog } from '@/components/common';
import { useUserMutations } from '@/hooks/users';
import { useUsersStore } from '@/stores/users.store';

export function DeleteUserDialog() {
  const { deleteUser } = useUserMutations();

  // Use selective subscriptions to prevent unnecessary re-renders
  const userToDelete = useUsersStore((state) => state.userToDelete);
  const setUserToDelete = useUsersStore((state) => state.setUserToDelete);

  const handleDelete = async (id: string, name: string) => {
    await deleteUser(id, name);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setUserToDelete(null);
    }
  };

  return (
    <DeleteDialog
      open={!!userToDelete}
      onOpenChange={handleOpenChange}
      entityToDelete={userToDelete}
      title="deleteDialog.title"
      description="deleteDialog.description"
      cancelText="deleteDialog.cancel"
      confirmText="deleteDialog.confirm"
      deletingText="deleteDialog.deleting"
      onDelete={handleDelete}
      translationNamespace="users"
    />
  );
}
