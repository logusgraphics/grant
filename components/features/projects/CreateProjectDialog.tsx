'use client';

import { Plus } from 'lucide-react';

import { CreateDialog } from '@/components/common';
import { useProjectMutations } from '@/hooks/projects';
import { useProjectsStore } from '@/stores/projects.store';

import { createProjectSchema, type CreateProjectFormValues } from './types';

export function CreateProjectDialog() {
  const isOpen = useProjectsStore((state) => state.isCreateDialogOpen);
  const setCreateDialogOpen = useProjectsStore((state) => state.setCreateDialogOpen);
  const { createProject } = useProjectMutations();

  const handleSubmit = async (values: CreateProjectFormValues) => {
    await createProject(values);
    setCreateDialogOpen(false);
  };

  return (
    <CreateDialog
      open={isOpen}
      onOpenChange={setCreateDialogOpen}
      title="createDialog.title"
      description="createDialog.description"
      triggerText="createDialog.trigger"
      confirmText="createDialog.confirm"
      cancelText="createDialog.cancel"
      icon={Plus}
      schema={createProjectSchema}
      defaultValues={{
        name: '',
        description: '',
      }}
      fields={[
        {
          name: 'name',
          label: 'form.name',
          placeholder: 'form.namePlaceholder',
          type: 'text',
        },
        {
          name: 'description',
          label: 'form.description',
          placeholder: 'form.descriptionPlaceholder',
          type: 'textarea',
        },
      ]}
      onCreate={handleSubmit}
      translationNamespace="projects"
      submittingText="createDialog.submitting"
    />
  );
}
