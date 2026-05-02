'use client';

import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGrant, type UseGrantResult } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';
import { SyncProjectPermissionsInput } from '@grantjs/schema';
import { AlertCircle, FileJson, Loader2, ShieldAlert, X } from 'lucide-react';
import { type FileRejection, useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import { JsonFileDropzone, type JsonFileDropzoneProps } from '@/components/common';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRequiresEmailVerificationForMutation } from '@/hooks/auth';
import { useScopeFromParams } from '@/hooks/common';
import { useStartProjectPermissionsSync } from '@/hooks/projects';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ACCEPT_JSON = {
  'application/json': ['.json'],
  'text/json': ['.json'],
} as const;

interface ParsedPayload {
  filename: string;
  size: number;
  payload: SyncProjectPermissionsInput;
}

function isParsedPayload(value: unknown): value is SyncProjectPermissionsInput {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.cdmVersion !== 'number') return false;
  if (!Array.isArray(candidate.roleTemplates)) return false;
  if (!Array.isArray(candidate.userAssignments)) return false;
  return true;
}

function generateImportId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `import-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function PermissionSyncJobStartDialog() {
  const t = useTranslations('permissionSyncJobs.startDialog');
  const tNotifications = useTranslations('permissionSyncJobs.notifications');
  const scope = useScopeFromParams();
  const params = useParams();
  const projectId = params.projectId as string;

  const projectGrantContext = useMemo(
    () =>
      projectId ? { resource: { id: projectId, scope: { projects: [projectId] } } } : undefined,
    [projectId]
  );

  const isOpen = usePermissionSyncJobsStore((state) => state.isStartDialogOpen);
  const setOpen = usePermissionSyncJobsStore((state) => state.setStartDialogOpen);
  const refetch = usePermissionSyncJobsStore((state) => state.refetch);

  const [parsed, setParsed] = useState<ParsedPayload | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { startSync } = useStartProjectPermissionsSync();
  const { isGranted: canStart, isLoading: grantLoading } = useGrant(
    ResourceSlug.Project,
    ResourceAction.Update,
    { scope, context: projectGrantContext, returnLoading: true }
  ) as UseGrantResult;
  const requiresEmailVerification = useRequiresEmailVerificationForMutation(scope);

  const reset = useCallback(() => {
    setParsed(null);
    setParseError(null);
    setSubmitting(false);
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejected: FileRejection[]) => {
      setParseError(null);
      if (rejected.length > 0) {
        const first = rejected[0]?.errors?.[0]?.code ?? '';
        if (first === 'file-too-large') {
          setParseError(t('errors.fileTooLarge', { maxSize: MAX_FILE_SIZE / 1024 / 1024 }));
        } else if (first === 'file-invalid-type') {
          setParseError(t('errors.invalidType'));
        } else {
          setParseError(t('errors.readFailed'));
        }
        return;
      }
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onerror = () => setParseError(t('errors.readFailed'));
      reader.onload = () => {
        try {
          const text = String(reader.result ?? '');
          const json = JSON.parse(text);
          if (!isParsedPayload(json)) {
            setParseError(t('errors.invalidShape'));
            return;
          }
          setParsed({
            filename: file.name,
            size: file.size,
            payload: json,
          });
        } catch {
          setParseError(t('errors.invalidJson'));
        }
      };
      reader.readAsText(file);
    },
    [t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT_JSON as unknown as Record<string, string[]>,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    noClick: !!parsed,
    noKeyboard: !!parsed,
    disabled: grantLoading || !canStart || requiresEmailVerification,
  });

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (submitting) return;
      setOpen(open);
      if (!open) reset();
    },
    [submitting, setOpen, reset]
  );

  const stats = useMemo(() => {
    if (!parsed) return null;
    return {
      roleTemplates: parsed.payload.roleTemplates?.length ?? 0,
      userAssignments: parsed.payload.userAssignments?.length ?? 0,
      cdmVersion: parsed.payload.cdmVersion,
    };
  }, [parsed]);

  const handleSubmit = useCallback(async () => {
    if (!parsed || !scope) return;
    setSubmitting(true);
    try {
      const input: SyncProjectPermissionsInput = {
        ...parsed.payload,
        importId: parsed.payload.importId ?? generateImportId(),
      };
      await startSync({ id: projectId, scope, input });
      toast.success(tNotifications('startSuccess'));
      refetch?.();
      setOpen(false);
      reset();
    } catch (error) {
      toast.error(tNotifications('startError'), {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }, [parsed, scope, projectId, startSync, tNotifications, refetch, setOpen, reset]);

  if (!scope) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-0 overflow-x-hidden sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        {grantLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">{t('checkingPermission')}</p>
          </div>
        ) : requiresEmailVerification ? (
          <Alert variant="warning">
            <AlertCircle className="size-4" />
            <AlertTitle>{t('emailVerificationTitle')}</AlertTitle>
            <AlertDescription>{t('emailVerificationDescription')}</AlertDescription>
          </Alert>
        ) : !canStart ? (
          <Alert variant="destructive">
            <ShieldAlert className="size-4" />
            <AlertTitle>{t('permissionDeniedTitle')}</AlertTitle>
            <AlertDescription>{t('permissionDeniedDescription')}</AlertDescription>
          </Alert>
        ) : !parsed ? (
          <JsonFileDropzone
            getRootProps={getRootProps as JsonFileDropzoneProps['getRootProps']}
            getInputProps={getInputProps as JsonFileDropzoneProps['getInputProps']}
            isDragActive={isDragActive}
            activeLabel={t('dropzone.active')}
            idleLabel={t('dropzone.idle')}
            hint={t('dropzone.hint')}
            browseLabel={t('dropzone.browse')}
            error={parseError}
          />
        ) : (
          <div className="min-w-0 max-w-full space-y-4">
            <div className="flex w-full min-w-0 max-w-full items-start gap-3 rounded-lg border p-4">
              <div className="flex min-w-0 flex-1 items-start gap-3 overflow-hidden">
                <FileJson className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="block min-w-0 truncate text-sm font-medium" title={parsed.filename}>
                    {parsed.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatBytes(parsed.size)}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={reset}
                aria-label={t('clear')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {stats && (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground">{t('summary.cdmVersion')}</p>
                  <p className="text-lg font-semibold">v{stats.cdmVersion}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground">{t('summary.roleTemplates')}</p>
                  <p className="text-lg font-semibold">{stats.roleTemplates}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground">{t('summary.userAssignments')}</p>
                  <p className="text-lg font-semibold">{stats.userAssignments}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              !parsed || submitting || !canStart || requiresEmailVerification || grantLoading
            }
          >
            {submitting ? t('submitting') : t('submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
