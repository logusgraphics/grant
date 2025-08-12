'use client';

import { DeleteDialog } from '@/components/common/DeleteDialog';
import { Tenant } from '@/graphql/generated/types';
import { useScopeFromParams } from '@/hooks/common/useScopeFromParams';
import { useOrganizationTagMutations } from '@/hooks/organization-tags';
import { useProjectTagMutations } from '@/hooks/project-tags';
import { useTagMutations } from '@/hooks/tags';
import { useTagsStore } from '@/stores/tags.store';

export function DeleteTagDialog() {
  const scope = useScopeFromParams();
  const { handleDeleteTag } = useTagMutations();
  const { removeOrganizationTag } = useOrganizationTagMutations();
  const { removeProjectTag } = useProjectTagMutations();
  const tagToDelete = useTagsStore((state) => state.tagToDelete);
  const setTagToDelete = useTagsStore((state) => state.setTagToDelete);

  const handleDelete = async (tagId: string, tagName: string) => {
    await handleDeleteTag(tagId, tagName);
  };

  const handleSuccess = async () => {
    if (tagToDelete) {
      try {
        if (scope.tenant === Tenant.Organization) {
          await removeOrganizationTag({
            organizationId: scope.id,
            tagId: tagToDelete.id,
          });
        } else if (scope.tenant === Tenant.Project) {
          await removeProjectTag({
            projectId: scope.id,
            tagId: tagToDelete.id,
          });
        }
      } catch (error) {
        console.error('Error removing tag from tenant:', error);
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTagToDelete(null);
    }
  };

  return (
    <DeleteDialog
      entityToDelete={tagToDelete}
      open={!!tagToDelete}
      onOpenChange={handleOpenChange}
      title="deleteDialog.title"
      description="deleteDialog.description"
      confirmText="deleteDialog.confirm"
      cancelText="deleteDialog.cancel"
      onDelete={handleDelete}
      onSuccess={handleSuccess}
      translationNamespace="tags"
      deletingText="deleteDialog.deleting"
    />
  );
}
