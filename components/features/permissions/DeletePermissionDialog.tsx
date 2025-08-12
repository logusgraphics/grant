'use client';

import { DeleteDialog } from '@/components/common';
import { Tenant } from '@/graphql/generated/types';
import { useScopeFromParams } from '@/hooks/common/useScopeFromParams';
import { useOrganizationPermissionMutations } from '@/hooks/organization-permissions';
import { usePermissionTagMutations } from '@/hooks/permission-tags';
import { usePermissionMutations } from '@/hooks/permissions';
import { useProjectPermissionMutations } from '@/hooks/project-permissions';
import { usePermissionsStore } from '@/stores/permissions.store';

export function DeletePermissionDialog() {
  const scope = useScopeFromParams();
  const { deletePermission } = usePermissionMutations();
  const { removePermissionTag } = usePermissionTagMutations();
  const { removeOrganizationPermission } = useOrganizationPermissionMutations();
  const { removeProjectPermission } = useProjectPermissionMutations();

  // Use selective subscriptions to prevent unnecessary re-renders
  const permissionToDelete = usePermissionsStore((state) => state.permissionToDelete);
  const setPermissionToDelete = usePermissionsStore((state) => state.setPermissionToDelete);

  const handleDelete = async (id: string, _name: string) => {
    await deletePermission(id);
  };

  const handleSuccess = async () => {
    if (!permissionToDelete) return;

    const cleanupPromises: Promise<any>[] = [];

    // Remove permission from tenant (organization or project)
    if (scope.tenant === Tenant.Organization) {
      cleanupPromises.push(
        removeOrganizationPermission({
          organizationId: scope.id,
          permissionId: permissionToDelete.id,
        }).catch((error: any) => {
          console.error('Error removing organization permission:', error);
        })
      );
    } else if (scope.tenant === Tenant.Project) {
      cleanupPromises.push(
        removeProjectPermission({
          projectId: scope.id,
          permissionId: permissionToDelete.id,
        }).catch((error: any) => {
          console.error('Error removing project permission:', error);
        })
      );
    }

    // Remove all tag relationships
    if (permissionToDelete.tags && permissionToDelete.tags.length > 0) {
      const removeTagPromises = permissionToDelete.tags.map((tag) =>
        removePermissionTag({
          permissionId: permissionToDelete.id,
          tagId: tag.id,
        }).catch((error: any) => {
          console.error('Error removing permission tag:', error);
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
      setPermissionToDelete(null);
    }
  };

  return (
    <DeleteDialog
      open={!!permissionToDelete}
      onOpenChange={handleOpenChange}
      entityToDelete={permissionToDelete}
      title="deleteDialog.title"
      description="deleteDialog.description"
      cancelText="deleteDialog.cancel"
      confirmText="deleteDialog.confirm"
      deletingText="deleteDialog.deleting"
      onDelete={handleDelete}
      onSuccess={handleSuccess}
      translationNamespace="permissions"
    />
  );
}
