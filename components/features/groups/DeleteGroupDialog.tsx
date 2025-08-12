'use client';

import { DeleteDialog } from '@/components/common';
import { Tenant } from '@/graphql/generated/types';
import { useScopeFromParams } from '@/hooks/common/useScopeFromParams';
import { useGroupPermissionMutations } from '@/hooks/group-permissions';
import { useGroupTagMutations } from '@/hooks/group-tags';
import { useGroupMutations } from '@/hooks/groups';
import { useOrganizationGroupMutations } from '@/hooks/organization-groups/useOrganizationGroupMutations';
import { useProjectGroupMutations } from '@/hooks/project-groups/useProjectGroupMutations';
import { useGroupsStore } from '@/stores/groups.store';

export function DeleteGroupDialog() {
  const scope = useScopeFromParams();
  const { deleteGroup } = useGroupMutations();
  const { removeGroupPermission } = useGroupPermissionMutations();
  const { removeGroupTag } = useGroupTagMutations();
  const { removeOrganizationGroup } = useOrganizationGroupMutations();
  const { removeProjectGroup } = useProjectGroupMutations();

  // Use selective subscriptions to prevent unnecessary re-renders
  const groupToDelete = useGroupsStore((state) => state.groupToDelete);
  const setGroupToDelete = useGroupsStore((state) => state.setGroupToDelete);

  const handleDelete = async (id: string, name: string) => {
    await deleteGroup(id, name);
  };

  const handleSuccess = async () => {
    if (!groupToDelete) return;

    const cleanupPromises: Promise<any>[] = [];

    // Remove group from tenant (organization or project)
    if (scope.tenant === Tenant.Organization) {
      cleanupPromises.push(
        removeOrganizationGroup({
          organizationId: scope.id,
          groupId: groupToDelete.id,
        }).catch((error: any) => {
          console.error('Error removing organization group:', error);
        })
      );
    } else if (scope.tenant === Tenant.Project) {
      cleanupPromises.push(
        removeProjectGroup({
          projectId: scope.id,
          groupId: groupToDelete.id,
        }).catch((error: any) => {
          console.error('Error removing project group:', error);
        })
      );
    }

    // Remove all permission relationships
    if (groupToDelete.permissions && groupToDelete.permissions.length > 0) {
      const removePermissionPromises = groupToDelete.permissions.map((permission) =>
        removeGroupPermission({
          groupId: groupToDelete.id,
          permissionId: permission.id,
        }).catch((error: any) => {
          console.error('Error removing group permission:', error);
        })
      );
      cleanupPromises.push(...removePermissionPromises);
    }

    // Remove all tag relationships
    if (groupToDelete.tags && groupToDelete.tags.length > 0) {
      const removeTagPromises = groupToDelete.tags.map((tag) =>
        removeGroupTag({
          groupId: groupToDelete.id,
          tagId: tag.id,
        }).catch((error: any) => {
          console.error('Error removing group tag:', error);
        })
      );
      cleanupPromises.push(...removeTagPromises);
    }

    // Execute all cleanup operations in parallel
    if (cleanupPromises.length > 0) {
      await Promise.all(cleanupPromises);
    }
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
      onSuccess={handleSuccess}
      translationNamespace="groups"
    />
  );
}
