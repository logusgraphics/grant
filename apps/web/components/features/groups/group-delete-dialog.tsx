'use client';

import { useGrant, type UseGrantResult } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';

import { DeleteDialog } from '@/components/common';
import { useRequiresEmailVerificationForMutation } from '@/hooks/auth';
import { useScopeFromParams } from '@/hooks/common';
import { useGroupMutations } from '@/hooks/groups';
import { useGroupsStore } from '@/stores/groups.store';

export function GroupDeleteDialog() {
  const scope = useScopeFromParams();
  const { deleteGroup } = useGroupMutations();
  const groupToDelete = useGroupsStore((state) => state.groupToDelete);
  const setGroupToDelete = useGroupsStore((state) => state.setGroupToDelete);

  const { isGranted: canDelete, isLoading: isDeleteLoading } = useGrant(
    ResourceSlug.Group,
    ResourceAction.Delete,
    { scope: scope!, enabled: !!groupToDelete, returnLoading: true }
  ) as UseGrantResult;
  const requiresEmailVerification = useRequiresEmailVerificationForMutation(scope);

  if (!scope || requiresEmailVerification) {
    return null;
  }

  if (!isDeleteLoading && !canDelete) {
    return null;
  }

  const handleDelete = async (id: string, name: string) => {
    await deleteGroup({ id, scope: scope! }, name);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setGroupToDelete(null);
    }
  };

  return (
    <DeleteDialog
      open={!!groupToDelete}
      onOpenChange={handleOpenChange}
      entityToDelete={groupToDelete}
      title="deleteDialog.title"
      description="deleteDialog.description"
      cancelText="deleteDialog.cancel"
      confirmText="deleteDialog.confirm"
      deletingText="deleteDialog.deleting"
      onDelete={handleDelete}
      translationNamespace="groups"
    />
  );
}
