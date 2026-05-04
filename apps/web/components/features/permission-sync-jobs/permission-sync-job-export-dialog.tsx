'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { CdmExportSection } from '@grantjs/core';
import { CDM_EXPORT_SECTIONS } from '@grantjs/core';
import { AlertCircle, Loader2 } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useScopeFromParams } from '@/hooks/common';
import { useExportProjectPermissions } from '@/hooks/projects';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

function buildSections(params: {
  tags: boolean;
  roleTemplates: boolean;
  userAssignments: boolean;
  projectUserApiKeys: boolean;
}): readonly CdmExportSection[] | undefined {
  const selected: CdmExportSection[] = [];
  if (params.roleTemplates) selected.push('roleTemplates');
  if (params.userAssignments) selected.push('userAssignments');
  if (params.projectUserApiKeys) selected.push('projectUserApiKeys');
  if (params.tags) selected.push('tags');
  if (
    selected.length === CDM_EXPORT_SECTIONS.length &&
    CDM_EXPORT_SECTIONS.every((s) => selected.includes(s))
  ) {
    return undefined;
  }
  return selected;
}

export function PermissionSyncJobExportDialog() {
  const t = useTranslations('permissionSyncJobs.exportDialog');
  const scope = useScopeFromParams();
  const params = useParams();
  const projectId = params.projectId as string | undefined;

  const open = usePermissionSyncJobsStore((s) => s.isExportDialogOpen);
  const setOpen = usePermissionSyncJobsStore((s) => s.setExportDialogOpen);

  const [tags, setTags] = useState(true);
  const [roleTemplates, setRoleTemplates] = useState(true);
  const [userAssignments, setUserAssignments] = useState(true);
  const [projectUserApiKeys, setProjectUserApiKeys] = useState(true);

  const { exportProject, loading, error, reset } = useExportProjectPermissions({
    id: projectId ?? '',
    scope,
  });

  useEffect(() => {
    if (open) {
      setTags(true);
      setRoleTemplates(true);
      setUserAssignments(true);
      setProjectUserApiKeys(true);
      reset();
    }
  }, [open, reset]);

  const onUserAssignmentsChecked = useCallback((checked: boolean) => {
    setUserAssignments(checked);
    if (!checked) {
      setProjectUserApiKeys(false);
    }
  }, []);

  const onProjectUserApiKeysChecked = useCallback((checked: boolean) => {
    if (checked) {
      setUserAssignments(true);
    }
    setProjectUserApiKeys(checked);
  }, []);

  const showReimportWithoutRolesWarning = userAssignments && !roleTemplates;

  const handleExport = useCallback(async () => {
    if (!projectId) return;
    const sections = buildSections({ tags, roleTemplates, userAssignments, projectUserApiKeys });
    const result = await exportProject(sections);
    if (result != null) {
      setOpen(false);
    }
  }, [exportProject, projectId, projectUserApiKeys, roleTemplates, setOpen, tags, userAssignments]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="cdm-export-role-templates"
              checked={roleTemplates}
              onCheckedChange={(v) => setRoleTemplates(v === true)}
            />
            <div className="grid gap-1">
              <Label htmlFor="cdm-export-role-templates" className="font-normal cursor-pointer">
                {t('sections.roleTemplates')}
              </Label>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="cdm-export-user-assignments"
              checked={userAssignments}
              onCheckedChange={(v) => onUserAssignmentsChecked(v === true)}
            />
            <div className="grid gap-1">
              <Label htmlFor="cdm-export-user-assignments" className="font-normal cursor-pointer">
                {t('sections.userAssignments')}
              </Label>
            </div>
          </div>

          <div className="flex items-start gap-3 pl-4 border-l border-border">
            <Checkbox
              id="cdm-export-project-user-api-keys"
              checked={projectUserApiKeys}
              disabled={!userAssignments}
              onCheckedChange={(v) => onProjectUserApiKeysChecked(v === true)}
            />
            <div className="grid gap-1">
              <Label
                htmlFor="cdm-export-project-user-api-keys"
                className="font-normal cursor-pointer"
              >
                {t('sections.projectUserApiKeys')}
              </Label>
              <p className="text-xs text-muted-foreground">{t('sections.keysNeedUsers')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="cdm-export-tags"
              checked={tags}
              onCheckedChange={(v) => setTags(v === true)}
            />
            <div className="grid gap-1">
              <Label htmlFor="cdm-export-tags" className="font-normal cursor-pointer">
                {t('sections.tags')}
              </Label>
            </div>
          </div>

          {showReimportWithoutRolesWarning ? (
            <Alert variant="warning" className="rounded-lg border-warning bg-warning/10">
              <AlertCircle aria-hidden />
              <AlertDescription className="text-xs">{t('helperReimport')}</AlertDescription>
            </Alert>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertDescription className="text-xs break-words">{error.message}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => void handleExport()}
            disabled={
              loading ||
              !projectId ||
              (!tags && !roleTemplates && !userAssignments && !projectUserApiKeys)
            }
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" aria-hidden />
                {t('exporting')}
              </>
            ) : (
              t('export')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
