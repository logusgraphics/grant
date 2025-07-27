'use client';

import { useTranslations } from 'next-intl';
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

interface DeleteRoleDialogProps {
  roleToDelete: { id: string; name: string } | null;
  onDeleteConfirm: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function DeleteRoleDialog({
  roleToDelete,
  onDeleteConfirm,
  onOpenChange,
}: DeleteRoleDialogProps) {
  const t = useTranslations('roles');

  return (
    <AlertDialog open={!!roleToDelete} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteDialog.description', { name: roleToDelete?.name || '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onDeleteConfirm}>
            {t('deleteDialog.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
