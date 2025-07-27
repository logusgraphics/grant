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

interface DeleteUserDialogProps {
  userToDelete: { id: string; name: string } | null;
  onDeleteConfirm: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function DeleteUserDialog({
  userToDelete,
  onDeleteConfirm,
  onOpenChange,
}: DeleteUserDialogProps) {
  const t = useTranslations('users');

  return (
    <AlertDialog open={!!userToDelete} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteDialog.description', { name: userToDelete?.name || '' })}
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
