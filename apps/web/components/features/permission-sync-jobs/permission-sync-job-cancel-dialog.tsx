'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGrant } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';
import { Ban } from 'lucide-react';
import { toast } from 'sonner';

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
import { useCancelProjectSync } from '@/hooks/projects';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

export function PermissionSyncJobCancelDialog() {
  const t = useTranslations('permissionSyncJobs.cancelDialog');
  const tNotifications = useTranslations('permissionSyncJobs.notifications');
  const scope = useScopeFromParams();

  const jobToCancel = usePermissionSyncJobsStore((state) => state.jobToCancel);
  const setJobToCancel = usePermissionSyncJobsStore((state) => state.setJobToCancel);
  const refetch = usePermissionSyncJobsStore((state) => state.refetch);

  const { cancelSync } = useCancelProjectSync();
  const [isCancelling, setIsCancelling] = useState(false);

  const canUpdate = useGrant(ResourceSlug.Project, ResourceAction.Update, {
    scope: scope!,
  });
  const requiresEmailVerification = useRequiresEmailVerificationForMutation(scope);

  if (!scope || !canUpdate || requiresEmailVerification) {
    return null;
  }

  const handleOpenChange = (open: boolean) => {
    if (isCancelling && !open) return;
    if (!open) setJobToCancel(null);
  };

  const handleConfirm = async () => {
    if (!jobToCancel) return;
    setIsCancelling(true);
    try {
      await cancelSync({ id: jobToCancel.projectId, scope, jobId: jobToCancel.id });
      toast.success(tNotifications('cancelSuccess'));
      refetch?.();
      setJobToCancel(null);
    } catch (error) {
      toast.error(tNotifications('cancelError'), {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <AlertDialog open={!!jobToCancel} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            {t('title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('description', {
              importId: jobToCancel?.importId ?? jobToCancel?.id ?? '',
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCancelling}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isCancelling}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Ban className="mr-2 h-4 w-4" />
            {isCancelling ? t('confirming') : t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
