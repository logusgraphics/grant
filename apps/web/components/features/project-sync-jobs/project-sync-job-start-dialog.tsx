'use client';

import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGrant, type UseGrantResult } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';
import { CdmModeStrategy, CdmOnConflict, type SyncProjectInput } from '@grantjs/schema';
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
import { useStartProjectSync } from '@/hooks/projects';
import { useProjectSyncJobsStore } from '@/stores/project-sync-jobs.store';

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ACCEPT_JSON = {
  'application/json': ['.json'],
  'text/json': ['.json'],
} as const;

interface ParsedPayload {
  filename: string;
  size: number;
  payload: SyncProjectInput;
}

function isParsedPayload(value: unknown): value is SyncProjectInput {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.version !== 'number') return false;
  if (!candidate.mode || typeof candidate.mode !== 'object') return false;
  const mode = candidate.mode as Record<string, unknown>;
  if (typeof mode.strategy !== 'string') return false;
  if (!Array.isArray(candidate.roles)) return false;
  if (!Array.isArray(candidate.users)) return false;
  if (candidate.resources !== undefined && !Array.isArray(candidate.resources)) return false;
  if (candidate.permissions !== undefined && !Array.isArray(candidate.permissions)) return false;
  if (candidate.groups !== undefined && !Array.isArray(candidate.groups)) return false;
  if (candidate.tags !== undefined && !Array.isArray(candidate.tags)) return false;
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

export function ProjectSyncJobStartDialog() {
  const t = useTranslations('projectSyncJobs.startDialog');
  const tNotifications = useTranslations('projectSyncJobs.notifications');
  const scope = useScopeFromParams();
  const params = useParams();
  const projectId = params.projectId as string;

  const projectGrantContext = useMemo(
    () =>
      projectId ? { resource: { id: projectId, scope: { projects: [projectId] } } } : undefined,
    [projectId]
  );

  const isOpen = useProjectSyncJobsStore((state) => state.isStartDialogOpen);
  const setOpen = useProjectSyncJobsStore((state) => state.setStartDialogOpen);
  const prependJob = useProjectSyncJobsStore((state) => state.prependJob);

  const [parsed, setParsed] = useState<ParsedPayload | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { startSync } = useStartProjectSync();
  const { isGranted: canStart, isLoading: grantLoading } = useGrant(
    ResourceSlug.ProjectSyncJob,
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
    const p = parsed.payload;
    const apiKeyCount = p.users?.reduce((n, u) => n + (u.apiKeys?.length ?? 0), 0) ?? 0;
    const jobName = typeof p.id === 'string' && p.id.trim() !== '' ? p.id.trim() : null;
    const strategy = p.mode?.strategy;
    const onConflict = p.mode?.onConflict ?? null;
    const confirmDestructive = Boolean(p.mode?.confirmDestructive);
    return {
      version: p.version,
      strategy,
      onConflict,
      confirmDestructive,
      jobName,
      roles: p.roles?.length ?? 0,
      users: p.users?.length ?? 0,
      apiKeys: apiKeyCount,
      groups: p.groups?.length ?? 0,
      resources: p.resources?.length ?? 0,
      permissions: p.permissions?.length ?? 0,
      tags: p.tags?.length ?? 0,
    };
  }, [parsed]);

  const strategyLabel = useMemo(() => {
    if (!stats?.strategy) return null;
    if (stats.strategy === CdmModeStrategy.Merge) return t('summary.strategy.merge');
    if (stats.strategy === CdmModeStrategy.Replace) return t('summary.strategy.replace');
    return String(stats.strategy);
  }, [stats?.strategy, t]);

  const onConflictLabel = useMemo(() => {
    if (!stats?.onConflict) return null;
    if (stats.onConflict === CdmOnConflict.Fail) return t('summary.onConflict.fail');
    if (stats.onConflict === CdmOnConflict.Skip) return t('summary.onConflict.skip');
    if (stats.onConflict === CdmOnConflict.Update) return t('summary.onConflict.update');
    return String(stats.onConflict);
  }, [stats?.onConflict, t]);

  const handleSubmit = useCallback(async () => {
    if (!parsed || !scope) return;
    setSubmitting(true);
    try {
      const existingId = parsed.payload.id;
      const id =
        typeof existingId === 'string' && existingId.trim() !== ''
          ? existingId.trim()
          : generateImportId();
      const input: SyncProjectInput = {
        ...parsed.payload,
        id,
      };
      const job = await startSync({ id: projectId, scope, input });
      setOpen(false);
      reset();
      toast.success(tNotifications('startSuccess'));
      if (job) {
        try {
          await useProjectSyncJobsStore.getState().refetch?.();
        } catch {
          // Best-effort; prepend below still surfaces the new row.
        }
        prependJob(job);
      }
    } catch (error) {
      toast.error(tNotifications('startError'), {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }, [parsed, scope, projectId, prependJob, startSync, tNotifications, setOpen, reset]);

  if (!scope) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-0 overflow-x-hidden sm:max-w-xl md:max-w-2xl">
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
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t('summary.jobParameters')}
                  </p>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5 rounded-md border bg-muted/30 p-3 text-sm sm:grid-cols-2">
                    <div className="min-w-0 sm:col-span-1">
                      <dt className="text-xs text-muted-foreground">{t('summary.version')}</dt>
                      <dd className="font-medium tabular-nums">v{stats.version}</dd>
                    </div>
                    <div className="min-w-0 sm:col-span-1">
                      <dt className="text-xs text-muted-foreground">
                        {t('summary.strategyLabel')}
                      </dt>
                      <dd className="font-medium">{strategyLabel ?? '—'}</dd>
                    </div>
                    {onConflictLabel ? (
                      <div className="min-w-0 sm:col-span-1">
                        <dt className="text-xs text-muted-foreground">
                          {t('summary.onConflictLabel')}
                        </dt>
                        <dd className="font-medium">{onConflictLabel}</dd>
                      </div>
                    ) : null}
                    {stats.confirmDestructive ? (
                      <div className="min-w-0 sm:col-span-1">
                        <dt className="text-xs text-muted-foreground">
                          {t('summary.confirmDestructiveLabel')}
                        </dt>
                        <dd className="font-medium">{t('summary.confirmDestructiveYes')}</dd>
                      </div>
                    ) : null}
                    {stats.jobName ? (
                      <div className="min-w-0 sm:col-span-2">
                        <dt className="text-xs text-muted-foreground">{t('summary.jobName')}</dt>
                        <dd className="break-all font-mono text-xs font-medium">{stats.jobName}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t('summary.entityCounts')}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                    <div className="rounded-md bg-muted p-2.5 sm:p-3">
                      <p className="text-xs text-muted-foreground">{t('summary.roles')}</p>
                      <p className="text-lg font-semibold tabular-nums">{stats.roles}</p>
                    </div>
                    <div className="rounded-md bg-muted p-2.5 sm:p-3">
                      <p className="text-xs text-muted-foreground">{t('summary.users')}</p>
                      <p className="text-lg font-semibold tabular-nums">{stats.users}</p>
                    </div>
                    <div className="rounded-md bg-muted p-2.5 sm:p-3">
                      <p className="text-xs text-muted-foreground">{t('summary.apiKeys')}</p>
                      <p className="text-lg font-semibold tabular-nums">{stats.apiKeys}</p>
                    </div>
                    <div className="rounded-md bg-muted p-2.5 sm:p-3">
                      <p className="text-xs text-muted-foreground">{t('summary.groups')}</p>
                      <p className="text-lg font-semibold tabular-nums">{stats.groups}</p>
                    </div>
                    <div className="rounded-md bg-muted p-2.5 sm:p-3">
                      <p className="text-xs text-muted-foreground">{t('summary.resources')}</p>
                      <p className="text-lg font-semibold tabular-nums">{stats.resources}</p>
                    </div>
                    <div className="rounded-md bg-muted p-2.5 sm:p-3">
                      <p className="text-xs text-muted-foreground">{t('summary.permissions')}</p>
                      <p className="text-lg font-semibold tabular-nums">{stats.permissions}</p>
                    </div>
                    <div className="rounded-md bg-muted p-2.5 sm:p-3">
                      <p className="text-xs text-muted-foreground">{t('summary.tags')}</p>
                      <p className="text-lg font-semibold tabular-nums">{stats.tags}</p>
                    </div>
                  </div>
                </div>

                {stats.apiKeys > 0 ? (
                  <p className="text-xs text-muted-foreground">{t('summary.byokNote')}</p>
                ) : null}
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
