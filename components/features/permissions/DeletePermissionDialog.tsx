'use client';

import { DeleteDialog } from '@/components/common';
import { usePermissionMutations } from '@/hooks/permissions';

interface DeletePermissionDialogProps {
  permissionToDelete: { id: string; name: string } | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeletePermissionDialog({
  permissionToDelete,
  onOpenChange,
  onSuccess,
}: DeletePermissionDialogProps) {
  const { deletePermission } = usePermissionMutations();

  const handleDelete = async (id: string) => {
    await deletePermission(id);
  };

  return (
    <DeleteDialog
      open={!!permissionToDelete}
      onOpenChange={onOpenChange}
      entityToDelete={permissionToDelete}
      title="deleteDialog.title"
      description="deleteDialog.description"
      cancelText="deleteDialog.cancel"
      confirmText="deleteDialog.confirm"
      deletingText="deleteDialog.deleting"
      onDelete={handleDelete}
      onSuccess={onSuccess}
      translationNamespace="permissions"
    />
  );
}
