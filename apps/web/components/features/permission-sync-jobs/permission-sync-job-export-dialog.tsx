'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { CdmExportSection } from '@grantjs/schema';
import { CDM_EXPORT_SECTIONS } from '@grantjs/schema';
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
import { useExportProjectSync } from '@/hooks/projects';
import { usePermissionSyncJobsStore } from '@/stores/permission-sync-jobs.store';

function buildSections(params: {
  resources: boolean;
  permissions: boolean;
  groups: boolean;
  tags: boolean;
  roles: boolean;
  users: boolean;
}): readonly CdmExportSection[] | undefined {
  const selected: CdmExportSection[] = [];
  if (params.resources) selected.push('resources');
  if (params.permissions) selected.push('permissions');
  if (params.groups) selected.push('groups');
  if (params.tags) selected.push('tags');
  if (params.roles) selected.push('roles');
  if (params.users) selected.push('users');
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

  const [resources, setResources] = useState(true);
  const [permissions, setPermissions] = useState(true);
  const [groups, setGroups] = useState(true);
  const [tags, setTags] = useState(true);
  const [roles, setRoles] = useState(true);
  const [users, setUsers] = useState(true);

  const { exportProject, loading, error, reset } = useExportProjectSync({
    id: projectId ?? '',
    scope,
  });

  useEffect(() => {
    if (open) {
      setResources(true);
      setPermissions(true);
      setGroups(true);
      setTags(true);
      setRoles(true);
      setUsers(true);
      reset();
    }
  }, [open, reset]);

  const onResourcesChecked = useCallback((checked: boolean) => {
    setResources(checked);
    if (!checked) {
      setPermissions(false);
    }
  }, []);

  const onPermissionsChecked = useCallback((checked: boolean) => {
    if (checked) {
      setResources(true);
    }
    setPermissions(checked);
  }, []);

  const showUsersWithoutRolesWarning = users && !roles;

  const handleExport = useCallback(async () => {
    if (!projectId) return;
    const sections = buildSections({
      resources,
      permissions,
      groups,
      tags,
      roles,
      users,
    });
    const result = await exportProject(sections);
    if (result != null) {
      setOpen(false);
    }
  }, [exportProject, permissions, projectId, resources, roles, setOpen, tags, users, groups]);

  const nothingSelected = !resources && !permissions && !groups && !tags && !roles && !users;

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
              id="cdm-export-resources"
              checked={resources}
              onCheckedChange={(v) => onResourcesChecked(v === true)}
            />
            <div className="grid gap-1">
              <Label htmlFor="cdm-export-resources" className="font-normal cursor-pointer">
                {t('sections.resources')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t('sections.catalogResourcesMayBeEmpty')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pl-4 border-l border-border">
            <Checkbox
              id="cdm-export-permissions"
              checked={permissions}
              disabled={!resources}
              onCheckedChange={(v) => onPermissionsChecked(v === true)}
            />
            <div className="grid gap-1">
              <Label htmlFor="cdm-export-permissions" className="font-normal cursor-pointer">
                {t('sections.permissions')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t('sections.permissionsNeedResources')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('sections.catalogPermissionsMayBeEmpty')}
              </p>
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

          <div className="flex items-start gap-3">
            <Checkbox
              id="cdm-export-groups"
              checked={groups}
              onCheckedChange={(v) => setGroups(v === true)}
            />
            <div className="grid gap-1">
              <Label htmlFor="cdm-export-groups" className="font-normal cursor-pointer">
                {t('sections.groups')}
              </Label>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="cdm-export-roles"
              checked={roles}
              onCheckedChange={(v) => setRoles(v === true)}
            />
            <div className="grid gap-1">
              <Label htmlFor="cdm-export-roles" className="font-normal cursor-pointer">
                {t('sections.roles')}
              </Label>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="cdm-export-users"
              checked={users}
              onCheckedChange={(v) => setUsers(v === true)}
            />
            <div className="grid gap-1">
              <Label htmlFor="cdm-export-users" className="font-normal cursor-pointer">
                {t('sections.users')}
              </Label>
              <p className="text-xs text-muted-foreground">{t('sections.usersIncludeApiKeys')}</p>
            </div>
          </div>

          {showUsersWithoutRolesWarning ? (
            <Alert variant="warning" className="rounded-lg border-warning bg-warning/10">
              <AlertCircle aria-hidden />
              <AlertDescription className="text-xs">{t('helperReimport')}</AlertDescription>
            </Alert>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertDescription className="text-xs wrap-break-word">
                {error.message}
              </AlertDescription>
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
            disabled={loading || !projectId || nothingSelected}
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
