'use client';

import { useTranslations } from 'next-intl';
import { useGrant } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';
import { Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRequiresEmailVerificationForMutation } from '@/hooks/auth';
import { useScopeFromParams } from '@/hooks/common';
import { useProjectAppMutations } from '@/hooks/project-apps';
import { useProjectAppsStore } from '@/stores/project-apps.store';

export function ProjectAppDeleteDialog() {
  const t = useTranslations('projectApps.deleteDialog');
  const scope = useScopeFromParams();
  const projectAppToDelete = useProjectAppsStore((state) => state.projectAppToDelete);
  const setProjectAppToDelete = useProjectAppsStore((state) => state.setProjectAppToDelete);
  const { deleteProjectApp } = useProjectAppMutations();

  const canDelete = useGrant(ResourceSlug.ProjectApp, ResourceAction.Delete, {
    scope: scope!,
    enabled: !!projectAppToDelete,
  });
  const requiresEmailVerification = useRequiresEmailVerificationForMutation(scope);

  if (!scope || requiresEmailVerification || !canDelete || !projectAppToDelete) {
    return null;
  }

  const handleDelete = async () => {
    try {
      await deleteProjectApp(projectAppToDelete.id, scope);
      setProjectAppToDelete(null);
    } catch {
      // Toast handled in mutation
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) setProjectAppToDelete(null);
  };

  return (
    <AlertDialog open={!!projectAppToDelete} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            {t('title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('description', {
              name: projectAppToDelete.name || projectAppToDelete.clientId,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
