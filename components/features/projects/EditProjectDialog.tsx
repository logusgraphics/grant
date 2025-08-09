'use client';

import { EditDialog } from '@/components/common';
import { useProjectMutations } from '@/hooks/projects';
import { useProjectsStore } from '@/stores/projects.store';

import { editProjectSchema, type EditProjectFormValues } from './types';

export function EditProjectDialog() {
  const projectToEdit = useProjectsStore((state) => state.projectToEdit);
  const setProjectToEdit = useProjectsStore((state) => state.setProjectToEdit);
  const { updateProject } = useProjectMutations();

  const handleSubmit = async (entityId: string, values: EditProjectFormValues) => {
    await updateProject(entityId, values);
    setProjectToEdit(null);
  };

  return (
    <EditDialog
      open={!!projectToEdit}
      onOpenChange={(open) => !open && setProjectToEdit(null)}
      entity={projectToEdit}
      title="editDialog.title"
      description="editDialog.description"
      confirmText="editDialog.confirm"
      cancelText="editDialog.cancel"
      updatingText="editDialog.updating"
      schema={editProjectSchema}
      defaultValues={
        projectToEdit
          ? {
              name: projectToEdit.name,
              description: projectToEdit.description || '',
            }
          : {}
      }
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
      mapEntityToFormValues={(project) => ({
        name: project.name,
        description: project.description || '',
      })}
      onUpdate={handleSubmit}
      translationNamespace="projects"
    />
  );
}
