'use client';

import { useState } from 'react';

import { EditDialog, EditDialogField } from '@/components/common/EditDialog';
import { Permission } from '@/graphql/generated/types';
import { usePermissionMutations } from '@/hooks/permissions';

import { EditPermissionFormValues, editPermissionSchema, EditPermissionDialogProps } from './types';

export function EditPermissionDialog({
  permission,
  open,
  onOpenChange,
}: EditPermissionDialogProps) {
  const { updatePermission } = usePermissionMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fields: EditDialogField[] = [
    {
      name: 'name',
      label: 'form.name',
      placeholder: 'form.name',
      type: 'text',
      required: true,
    },
    {
      name: 'action',
      label: 'form.action',
      placeholder: 'form.action',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'form.description',
      placeholder: 'form.description',
      type: 'textarea',
      required: false,
    },
  ];

  const mapPermissionToFormValues = (permission: Permission): EditPermissionFormValues => ({
    name: permission.name,
    action: permission.action,
    description: permission.description || '',
  });

  const handleUpdate = async (permissionId: string, values: EditPermissionFormValues) => {
    setIsSubmitting(true);
    try {
      await updatePermission(permissionId, {
        name: values.name,
        description: values.description,
        action: values.action,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EditDialog
      entity={permission}
      open={open}
      onOpenChange={onOpenChange}
      title="editDialog.title"
      description="editDialog.description"
      confirmText="editDialog.confirm"
      schema={editPermissionSchema}
      defaultValues={{
        name: '',
        action: '',
        description: '',
      }}
      fields={fields}
      mapEntityToFormValues={mapPermissionToFormValues}
      onUpdate={handleUpdate}
      translationNamespace="permissions"
      isSubmitting={isSubmitting}
      updatingText="editDialog.updating"
    />
  );
}
