'use client';

import { Key } from 'lucide-react';

import {
  CreateDialog,
  CreateDialogField,
  CreateDialogRelationship,
} from '@/components/common/CreateDialog';
import { TagCheckboxList } from '@/components/ui/tag-checkbox-list';
import { Tenant } from '@/graphql/generated/types';
import { useScopeFromParams } from '@/hooks/common/useScopeFromParams';
import { useOrganizationPermissionMutations } from '@/hooks/organization-permissions';
import { usePermissionTagMutations } from '@/hooks/permission-tags';
import { usePermissionMutations } from '@/hooks/permissions';
import { useProjectPermissionMutations } from '@/hooks/project-permissions';
import { useTags } from '@/hooks/tags';
import { usePermissionsStore } from '@/stores/permissions.store';

import { createPermissionSchema, CreatePermissionFormValues } from './types';

export function CreatePermissionDialog() {
  const scope = useScopeFromParams();
  const { tags, loading: tagsLoading } = useTags({ scope });
  const { createPermission } = usePermissionMutations();
  const { addPermissionTag } = usePermissionTagMutations();
  const { addOrganizationPermission } = useOrganizationPermissionMutations();
  const { addProjectPermission } = useProjectPermissionMutations();

  // Use selective subscriptions to prevent unnecessary re-renders
  const isCreateDialogOpen = usePermissionsStore((state) => state.isCreateDialogOpen);
  const setCreateDialogOpen = usePermissionsStore((state) => state.setCreateDialogOpen);

  const fields: CreateDialogField[] = [
    {
      name: 'name',
      label: 'form.name',
      placeholder: 'form.name',
      type: 'text',
    },
    {
      name: 'action',
      label: 'form.action',
      placeholder: 'form.action',
      type: 'text',
    },
    {
      name: 'description',
      label: 'form.description',
      placeholder: 'form.description',
      type: 'textarea',
    },
  ];

  const relationships: CreateDialogRelationship[] = [
    {
      name: 'tagIds',
      label: 'form.tags',
      renderComponent: (props: any) => <TagCheckboxList {...props} />,
      items: tags,
      loading: tagsLoading,
      loadingText: 'form.tagsLoading',
      emptyText: 'form.noTagsAvailable',
    },
  ];

  const handleCreate = async (values: CreatePermissionFormValues) => {
    return await createPermission({
      name: values.name,
      description: values.description,
      action: values.action,
    });
  };

  const handleAddRelationships = async (
    permissionId: string,
    values: CreatePermissionFormValues
  ) => {
    const promises: Promise<any>[] = [];

    // Add permission to tenant
    if (scope.tenant === Tenant.Organization) {
      promises.push(
        addOrganizationPermission({
          organizationId: scope.id,
          permissionId,
        }).catch((error: any) => {
          console.error('Error adding organization permission:', error);
        })
      );
    } else if (scope.tenant === Tenant.Project) {
      promises.push(
        addProjectPermission({
          projectId: scope.id,
          permissionId,
        }).catch((error: any) => {
          console.error('Error adding project permission:', error);
        })
      );
    }

    // Add tags
    if (values.tagIds && values.tagIds.length > 0) {
      const addTagPromises = values.tagIds.map((tagId) =>
        addPermissionTag({
          permissionId,
          tagId,
        }).catch((error: any) => {
          console.error('Error adding permission tag:', error);
        })
      );
      promises.push(...addTagPromises);
    }

    await Promise.all(promises);
  };

  const handleOpenChange = (open: boolean) => {
    setCreateDialogOpen(open);
  };

  return (
    <CreateDialog
      open={isCreateDialogOpen}
      onOpenChange={handleOpenChange}
      title="createDialog.title"
      description="createDialog.description"
      triggerText="createDialog.trigger"
      confirmText="createDialog.confirm"
      cancelText="createDialog.cancel"
      icon={Key}
      schema={createPermissionSchema}
      defaultValues={{
        name: '',
        action: '',
        description: '',
        tagIds: [],
      }}
      fields={fields}
      relationships={relationships}
      onCreate={handleCreate}
      onAddRelationships={handleAddRelationships}
      translationNamespace="permissions"
      submittingText="createDialog.submitting"
    />
  );
}
