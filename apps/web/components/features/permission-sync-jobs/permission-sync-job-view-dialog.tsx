'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProjectPermissionsSyncJob, ProjectPermissionsSyncJobStatus } from '@grantjs/schema';
import { AlertCircle, ArrowLeftRight, Download, Info, Loader2, RefreshCw } from 'lucide-react';

import { CopyToClipboard, JsonEditor } from '@/components/common';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useScopeFromParams } from '@/hooks/common';
import {
  useProjectPermissionsSyncJob,
  useProjectPermissionsSyncJobPayload,
  useProjectPermissionsSyncJobSnapshot,
} from '@/hooks/projects';
import { formatTimestamp } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

import { PermissionSyncJobStatusBadge } from './permission-sync-job-status-badge';

type ViewTab = 'status' | 'result' | 'payload' | 'snapshot';

/** Result counters that render `left` + ArrowLeftRight + `right` labels. */
const RESULT_LINK_KEYS = new Set<string>([
  'roleGroupsLinked',
  'groupPermissionsLinked',
  'projectRolesLinked',
  'projectGroupsLinked',
  'projectPermissionsLinked',
  'projectResourcesLinked',
]);

interface SectionRowProps {
  label: string;
  value: React.ReactNode;
  copy?: string;
}

function SectionRow({ label, value, copy }: SectionRowProps) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-3 py-1.5 text-sm">
      <div className="text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2 min-w-0">
        <div className="min-w-0 break-all">{value}</div>
        {copy && <CopyToClipboard text={copy} size="sm" variant="ghost" />}
      </div>
    </div>
  );
}

export function PermissionSyncJobViewDialog() {
  const t = useTranslations('permissionSyncJobs.viewDialog');
  const scope = useScopeFromParams();

  const jobToView = usePermissionSyncJobsStore((state) => state.jobToView);
  const setJobToView = usePermissionSyncJobsStore((state) => state.setJobToView);

  const [tab, setTab] = useState<ViewTab>('status');

  const { job, polling } = useProjectPermissionsSyncJob({
    id: jobToView?.projectId ?? '',
    scope: scope ?? undefined,
    jobId: jobToView?.id,
    skip: !jobToView,
  });

  const currentJob: ProjectPermissionsSyncJob | undefined = job ?? jobToView ?? undefined;
  const isCompleted = currentJob?.status === ProjectPermissionsSyncJobStatus.Completed;

  const {
    payload,
    loading: payloadLoading,
    error: payloadError,
    download,
    reload,
  } = useProjectPermissionsSyncJobPayload({
    id: currentJob?.projectId ?? '',
    scope: scope ?? null,
    jobId: tab === 'payload' ? currentJob?.id : null,
  });

  /**
   * Only fetch the snapshot when (a) the user has switched to its tab and
   * (b) the job actually has one. Together these gates avoid a noisy 404
   * round-trip for jobs that pre-date the snapshot column or that failed
   * before the worker reached the snapshot step.
   */
  const snapshotEligible = tab === 'snapshot' && !!currentJob?.hasSnapshot;
  const {
    snapshot,
    loading: snapshotLoading,
    error: snapshotError,
    download: downloadSnapshot,
    reload: reloadSnapshot,
  } = useProjectPermissionsSyncJobSnapshot({
    id: currentJob?.projectId ?? '',
    scope: scope ?? null,
    jobId: snapshotEligible ? (currentJob?.id ?? null) : null,
    skip: !snapshotEligible,
  });

  const handleClose = () => {
    setJobToView(null);
    setTab('status');
  };

  const tabs: ReadonlyArray<{ id: ViewTab; label: string }> = useMemo(
    () => [
      { id: 'status', label: t('tabs.status') },
      { id: 'result', label: t('tabs.result') },
      { id: 'payload', label: t('tabs.payload') },
      { id: 'snapshot', label: t('tabs.snapshot') },
    ],
    [t]
  );

  const result = currentJob?.result;

  return (
    <Dialog open={!!jobToView} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t('title')}
            {currentJob && <PermissionSyncJobStatusBadge status={currentJob.status} />}
          </DialogTitle>
          <DialogDescription>
            {currentJob?.importId ? (
              <>{t('descriptionWithImport', { importId: currentJob.importId })}</>
            ) : (
              t('description')
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="border-b -mx-6 px-6">
          <div className="flex items-center gap-2">
            {tabs.map((entry) => {
              const active = entry.id === tab;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setTab(entry.id)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                    active
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                  aria-pressed={active}
                >
                  {entry.label}
                </button>
              );
            })}
            {polling && (
              <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t('polling')}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto py-2">
          {!currentJob ? (
            <div className="py-8 text-center text-sm text-muted-foreground">{t('loading')}</div>
          ) : tab === 'status' ? (
            <div className="space-y-1">
              <SectionRow label={t('fields.jobId')} value={currentJob.id} copy={currentJob.id} />
              <SectionRow
                label={t('fields.importId')}
                value={
                  currentJob.importId ?? (
                    <span className="text-muted-foreground">{t('fields.notSet')}</span>
                  )
                }
                copy={currentJob.importId ?? undefined}
              />
              <SectionRow label={t('fields.cdmVersion')} value={`v${currentJob.cdmVersion}`} />
              <SectionRow
                label={t('fields.enqueuedAt')}
                value={formatTimestamp(currentJob.enqueuedAt)}
              />
              <SectionRow
                label={t('fields.startedAt')}
                value={
                  currentJob.startedAt ? (
                    formatTimestamp(currentJob.startedAt)
                  ) : (
                    <span className="text-muted-foreground">{t('fields.notSet')}</span>
                  )
                }
              />
              <SectionRow
                label={t('fields.completedAt')}
                value={
                  currentJob.completedAt ? (
                    formatTimestamp(currentJob.completedAt)
                  ) : (
                    <span className="text-muted-foreground">{t('fields.notSet')}</span>
                  )
                }
              />
              {currentJob.cancelledAt && (
                <SectionRow
                  label={t('fields.cancelledAt')}
                  value={formatTimestamp(currentJob.cancelledAt)}
                />
              )}

              {currentJob.errorMessage && (
                <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">{t('fields.errorMessage')}</p>
                      <p className="break-words">{currentJob.errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {currentJob.warnings && currentJob.warnings.length > 0 && (
                <div className="mt-3 rounded-md border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-3 text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-1">
                    {t('fields.warnings', { count: currentJob.warnings.length })}
                  </p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {currentJob.warnings.map((warning, idx) => (
                      <li key={idx} className="break-words">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : tab === 'result' ? (
            !isCompleted || !result ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {t('result.notAvailable')}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  ['rolesCreated', result.rolesCreated],
                  ['groupsCreated', result.groupsCreated],
                  ['roleGroupsLinked', result.roleGroupsLinked],
                  ['groupPermissionsLinked', result.groupPermissionsLinked],
                  ['projectRolesLinked', result.projectRolesLinked],
                  ['projectGroupsLinked', result.projectGroupsLinked],
                  ['projectPermissionsLinked', result.projectPermissionsLinked],
                  ['projectResourcesLinked', result.projectResourcesLinked],
                  ['projectUsersEnsured', result.projectUsersEnsured],
                  ['userRolesAssigned', result.userRolesAssigned],
                ].map(([key, value]) => (
                  <div key={key as string} className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">
                      {RESULT_LINK_KEYS.has(key as string) ? (
                        <span className="inline-flex items-center gap-1">
                          <span>{t(`result.${key as string}.left`)}</span>
                          <ArrowLeftRight className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
                          <span>{t(`result.${key as string}.right`)}</span>
                        </span>
                      ) : (
                        t(`result.${key as string}`)
                      )}
                    </p>
                    <p className="text-lg font-semibold">{value as number}</p>
                  </div>
                ))}
              </div>
            )
          ) : tab === 'payload' ? (
            <div className="space-y-3">
              {payloadError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="break-words">{payloadError.message}</p>
                </div>
              ) : payloadLoading && !payload ? (
                <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('payload.loading')}
                </div>
              ) : payload ? (
                <JsonEditor value={payload as object} disabled />
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {t('payload.notAvailable')}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {!currentJob.hasSnapshot ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {t('snapshot.notAvailable')}
                </div>
              ) : (
                <>
                  <Alert
                    variant="info"
                    className="items-center text-xs [&>svg]:translate-y-0 [&_[data-slot=alert-description]]:text-xs"
                  >
                    <Info className="size-4 shrink-0 self-center" aria-hidden />
                    <AlertDescription>
                      {currentJob.snapshotTakenAt
                        ? t('snapshot.takenAt', {
                            time: formatTimestamp(currentJob.snapshotTakenAt),
                          })
                        : t('snapshot.summary')}
                    </AlertDescription>
                  </Alert>
                  {snapshotError ? (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p className="break-words">{snapshotError.message}</p>
                    </div>
                  ) : snapshotLoading && !snapshot ? (
                    <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('snapshot.loading')}
                    </div>
                  ) : snapshot ? (
                    <JsonEditor value={snapshot as object} disabled />
                  ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      {t('snapshot.notAvailable')}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row flex-wrap items-center justify-end gap-2">
          {tab === 'payload' && currentJob && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => void reload()}
                disabled={payloadLoading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('payload.reload')}
              </Button>
              <Button
                type="button"
                onClick={() => void download()}
                disabled={payloadLoading || !payload}
              >
                <Download className="mr-2 h-4 w-4" />
                {t('payload.download')}
              </Button>
            </>
          )}
          {tab === 'snapshot' && currentJob?.hasSnapshot && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => void reloadSnapshot()}
                disabled={snapshotLoading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('snapshot.reload')}
              </Button>
              <Button
                type="button"
                onClick={() => void downloadSnapshot()}
                disabled={snapshotLoading || !snapshot}
              >
                <Download className="mr-2 h-4 w-4" />
                {t('snapshot.download')}
              </Button>
            </>
          )}
          <Button type="button" variant="outline" onClick={handleClose}>
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
