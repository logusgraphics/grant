'use client';

import { useState, useCallback, useEffect } from 'react';

import {
  Permission,
  PermissionSortableField,
  PermissionSortOrder,
} from '@/graphql/generated/types';
import { usePermissions } from '@/hooks/permissions';

import { DeletePermissionDialog } from './DeletePermissionDialog';
import { EditPermissionDialog } from './EditPermissionDialog';
import { PermissionViewer } from './PermissionViewer';
import { PermissionView } from './PermissionViewSwitcher';

interface PermissionsContainerProps {
  page: number;
  limit: number;
  search: string;
  sort?: {
    field: PermissionSortableField;
    order: PermissionSortOrder;
  };
  view: PermissionView;
  tagIds?: string[];
  onTotalCountChange?: (totalCount: number) => void;
}

export function PermissionsContainer({
  page,
  limit,
  search,
  sort,
  view,
  tagIds,
  onTotalCountChange,
}: PermissionsContainerProps) {
  const { permissions, loading, error, totalCount, refetch } = usePermissions({
    page,
    limit,
    search,
    sort,
    tagIds,
  });

  const [permissionToDelete, setPermissionToDelete] = useState<{ id: string; name: string } | null>(
    null
  );
  const [permissionToEdit, setPermissionToEdit] = useState<Permission | null>(null);

  // Update parent with total count when data changes
  useEffect(() => {
    if (totalCount) {
      onTotalCountChange?.(totalCount);
    }
  }, [totalCount, onTotalCountChange]);

  const handleEditClick = useCallback((permission: Permission) => {
    setPermissionToEdit(permission);
  }, []);

  const handleDeleteClick = useCallback((permission: Permission) => {
    setPermissionToDelete({ id: permission.id, name: permission.name });
  }, []);

  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <PermissionViewer
        limit={limit}
        permissions={permissions}
        loading={loading}
        search={search}
        view={view}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      <DeletePermissionDialog
        permissionToDelete={permissionToDelete}
        onOpenChange={() => setPermissionToDelete(null)}
        onSuccess={refetch}
      />

      <EditPermissionDialog
        permission={permissionToEdit}
        open={!!permissionToEdit}
        onOpenChange={(open: boolean) => !open && setPermissionToEdit(null)}
      />
    </>
  );
}
