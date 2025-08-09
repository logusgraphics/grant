'use client';

import { EditDialog, EditDialogField } from '@/components/common/EditDialog';
import { Organization } from '@/graphql/generated/types';
import { useOrganizationMutations } from '@/hooks/organizations';
import { useOrganizationsStore } from '@/stores/organizations.store';

import { editOrganizationSchema, EditOrganizationFormValues } from './types';

export function EditOrganizationDialog() {
  const { updateOrganization } = useOrganizationMutations();

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

  const mapOrganizationToFormValues = (organization: Organization): EditOrganizationFormValues => ({
    name: organization.name,
  });

  const handleUpdate = async (organizationId: string, values: EditOrganizationFormValues) => {
    await updateOrganization(organizationId, {
      name: values.name,
    });
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
      }}
      fields={fields}
      mapEntityToFormValues={mapOrganizationToFormValues}
      onUpdate={handleUpdate}
      translationNamespace="organizations"
    />
  );
}
