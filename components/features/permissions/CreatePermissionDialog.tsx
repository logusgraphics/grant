'use client';

import { useState } from 'react';

import { Key } from 'lucide-react';

import { CreateDialog, CreateDialogField } from '@/components/common/CreateDialog';
import { usePermissionMutations } from '@/hooks/permissions';

import {
  createPermissionSchema,
  CreatePermissionFormValues,
  CreatePermissionDialogProps,
} from './types';

interface CreatePermissionDialogComponentProps extends Partial<CreatePermissionDialogProps> {
  children?: React.ReactNode;
}

export function CreatePermissionDialog({
  open,
  onOpenChange,
  children,
}: CreatePermissionDialogComponentProps) {
  const { createPermission } = usePermissionMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCreate = async (values: CreatePermissionFormValues) => {
    setIsSubmitting(true);
    try {
      return await createPermission({
        name: values.name,
        description: values.description,
        action: values.action,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CreateDialog
      open={open}
      onOpenChange={onOpenChange}
      title="createDialog.title"
      description="createDialog.description"
      triggerText="createDialog.trigger"
      confirmText="createDialog.confirm"
      cancelText="deleteDialog.cancel"
      icon={Key}
      schema={createPermissionSchema}
      defaultValues={{
        name: '',
        action: '',
        description: '',
      }}
      fields={fields}
      onCreate={handleCreate}
      translationNamespace="permissions"
      isSubmitting={isSubmitting}
      submittingText="createDialog.submitting"
    >
      {children}
    </CreateDialog>
  );
}
