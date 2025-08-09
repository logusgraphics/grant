'use client';

import {
  EditDialog,
  EditDialogField,
  EditDialogRelationship,
} from '@/components/common/EditDialog';
import { TagCheckboxList } from '@/components/ui/tag-checkbox-list';
import { Organization, Tag } from '@/graphql/generated/types';
import { useScopeFromParams } from '@/hooks/common/useScopeFromParams';
import { useOrganizationMutations } from '@/hooks/organizations';
import { useTags } from '@/hooks/tags';
import { useOrganizationsStore } from '@/stores/organizations.store';

import { editOrganizationSchema, EditOrganizationFormValues } from './types';

export function EditOrganizationDialog() {
  const scope = useScopeFromParams();
  const { tags, loading: tagsLoading } = useTags({ scope });
  const { updateOrganization, addOrganizationTag, removeOrganizationTag } =
    useOrganizationMutations();

  // Use selective subscriptions to prevent unnecessary re-renders
  const organizationToEdit = useOrganizationsStore((state) => state.organizationToEdit);
  const setOrganizationToEdit = useOrganizationsStore((state) => state.setOrganizationToEdit);

  const fields: EditDialogField[] = [
    {
      name: 'name',
      label: 'form.name',
      placeholder: 'form.name',
      type: 'text',
      required: true,
    },
  ];

  const relationships: EditDialogRelationship[] = [
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

  const mapOrganizationToFormValues = (organization: Organization): EditOrganizationFormValues => ({
    name: organization.name,
    tagIds: organization.tags?.map((tag: Tag) => tag.id),
  });

  const handleUpdate = async (organizationId: string, values: EditOrganizationFormValues) => {
    await updateOrganization(organizationId, {
      name: values.name,
    });
  };

  const handleAddRelationships = async (
    organizationId: string,
    relationshipName: string,
    itemIds: string[]
  ) => {
    if (relationshipName === 'tagIds') {
      const addPromises = itemIds.map((tagId) =>
        addOrganizationTag({
          organizationId,
          tagId,
        }).catch((error: any) => {
          console.error('Error adding organization tag:', error);
          throw error;
        })
      );
      await Promise.all(addPromises);
    }
  };

  const handleRemoveRelationships = async (
    organizationId: string,
    relationshipName: string,
    itemIds: string[]
  ) => {
    if (relationshipName === 'tagIds') {
      const removePromises = itemIds.map((tagId) =>
        removeOrganizationTag({
          organizationId,
          tagId,
        }).catch((error: any) => {
          console.error('Error removing organization tag:', error);
          throw error;
        })
      );
      await Promise.all(removePromises);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setOrganizationToEdit(null);
    }
  };

  return (
    <EditDialog
      entity={organizationToEdit}
      open={!!organizationToEdit}
      onOpenChange={handleOpenChange}
      title="editDialog.title"
      description="editDialog.description"
      confirmText="editDialog.confirm"
      cancelText="editDialog.cancel"
      updatingText="editDialog.updating"
      schema={editOrganizationSchema}
      defaultValues={{
        name: '',
        tagIds: [],
      }}
      fields={fields}
      relationships={relationships}
      mapEntityToFormValues={mapOrganizationToFormValues}
      onUpdate={handleUpdate}
      onAddRelationships={handleAddRelationships}
      onRemoveRelationships={handleRemoveRelationships}
      translationNamespace="organizations"
    />
  );
}
