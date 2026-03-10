'use client';

import { useMemo, useState } from 'react';

import { useGrant } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';
import { UserAuthenticationMethodProvider } from '@grantjs/schema';
import { LayoutGrid } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import {
  CreateDialog,
  type DialogField,
  type DialogRelationship,
  CheckboxList,
  type CheckboxListProps,
  PrimaryTagSelector,
  type PrimaryTagSelectorProps,
  TagCheckboxList,
  type TagCheckboxListProps,
} from '@/components/common';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRequiresEmailVerificationForMutation } from '@/hooks/auth';
import { useScopeFromParams } from '@/hooks/common';
import { useProjectAppFormData, useProjectAppMutations } from '@/hooks/project-apps';
import { useTags } from '@/hooks/tags';
import { useProjectAppsStore } from '@/stores/project-apps.store';

import type { CreateProjectAppResult, Scope } from '@grantjs/schema';
import type { DefaultValues } from 'react-hook-form';

/** Providers available for project OAuth (subset of UserAuthenticationMethodProvider). */
const PROJECT_OAUTH_PROVIDER_OPTIONS = [
  { id: UserAuthenticationMethodProvider.Email, nameKey: 'providers.email' },
  { id: UserAuthenticationMethodProvider.Github, nameKey: 'providers.github' },
] as const;

const createProjectAppSchema = z
  .object({
    name: z.string().max(255, 'errors.validation.nameTooLong').optional(),
    redirectUris: z
      .array(z.url('errors.validation.invalidUrl'))
      .min(1, 'errors.validation.redirectUrisMinOne'),
    scopes: z.array(z.string()).optional(),
    enabledProviders: z.array(z.string()).optional(),
    allowSignUp: z.boolean().optional(),
    signUpRoleId: z.string().uuid().optional().or(z.literal('')).nullable(),
    tagIds: z.array(z.string()).optional(),
    primaryTagId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.allowSignUp !== false) {
        return !!data.signUpRoleId && data.signUpRoleId !== '';
      }
      return true;
    },
    { message: 'errors.validation.signUpRoleRequired', path: ['signUpRoleId'] }
  );

export type ProjectAppCreateFormValues = z.infer<typeof createProjectAppSchema>;

export interface ProjectAppCreateDialogProps {
  scope?: Scope | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onProjectAppCreated?: (result: CreateProjectAppResult | null) => void;
  /** When true, trigger label is always visible (e.g. empty state). When false/undefined, toolbar responsive behavior. */
  triggerAlwaysShowLabel?: boolean;
}

export function ProjectAppCreateDialog({
  scope: scopeProp,
  open,
  onOpenChange,
  onProjectAppCreated,
  triggerAlwaysShowLabel,
}: ProjectAppCreateDialogProps) {
  const t = useTranslations('projectApps');
  const scopeFromParams = useScopeFromParams();
  const scope = scopeProp ?? scopeFromParams;
  const projectId = useMemo(() => (scope?.id ? scope.id.split(':')[1] : undefined), [scope]);
  const {
    projectRoles,
    scopeSlugs,
    loading: formDataLoading,
  } = useProjectAppFormData(scope, projectId);
  const { tags, loading: tagsLoading } = useTags({ scope: scope!, limit: -1 });
  const { createProjectApp } = useProjectAppMutations();
  const handleProjectAppCreated = useProjectAppsStore((state) => state.handleProjectAppCreated);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const canCreate = useGrant(ResourceSlug.ProjectApp, ResourceAction.Create, {
    scope: scope!,
  });
  const requiresEmailVerification = useRequiresEmailVerificationForMutation(scope);

  const defaultValues: DefaultValues<ProjectAppCreateFormValues> = useMemo(
    () => ({
      name: '',
      redirectUris: [],
      scopes: [],
      enabledProviders: [],
      allowSignUp: true,
      signUpRoleId: '',
      tagIds: [],
      primaryTagId: '',
    }),
    []
  );

  const providerItems = useMemo(
    () =>
      PROJECT_OAUTH_PROVIDER_OPTIONS.map((opt) => ({
        id: opt.id,
        name: t(opt.nameKey),
      })),
    [t]
  );

  const scopeSlugItems = useMemo(
    () =>
      scopeSlugs.map((s) => ({
        id: s.slug,
        name: s.name,
        description: s.description ?? undefined,
      })),
    [scopeSlugs]
  );

  const signUpRoleOptions = useMemo(
    () => projectRoles.map((r) => ({ value: r.id, label: r.name })),
    [projectRoles]
  );

  const relationships: DialogRelationship[] = useMemo(
    () => [
      {
        name: 'scopes',
        label: 'form.scopes',
        renderComponent: (props: CheckboxListProps) => <CheckboxList {...props} />,
        items: scopeSlugItems,
        loading: formDataLoading,
        loadingText: 'form.tagsLoading',
        emptyText: 'form.noScopesAvailable',
        emptyComponent: (
          <Alert variant="info" className="rounded-lg border-info bg-info/10">
            <AlertDescription>{t('form.noScopesAvailable')}</AlertDescription>
          </Alert>
        ),
      },
      {
        name: 'enabledProviders',
        label: 'form.enabledProviders',
        renderComponent: (props: CheckboxListProps) => <CheckboxList {...props} />,
        items: providerItems,
        loading: false,
        loadingText: 'form.tagsLoading',
        emptyText: 'form.noProvidersAvailable',
      },
      {
        name: 'tagIds',
        label: 'form.tags',
        renderComponent: (props: TagCheckboxListProps) => <TagCheckboxList {...props} />,
        items: tags,
        loading: tagsLoading,
        loadingText: 'form.tagsLoading',
        emptyText: 'form.noTagsAvailable',
      },
      {
        name: 'primaryTagId',
        label: 'form.primaryTag',
        renderComponent: (props: PrimaryTagSelectorProps) => <PrimaryTagSelector {...props} />,
        items: tags,
        loading: tagsLoading,
        loadingText: 'form.tagsLoading',
        emptyText: 'form.noTagsAvailable',
      },
    ],
    [tags, tagsLoading, providerItems, scopeSlugItems, formDataLoading, t]
  );

  const fields: DialogField[] = useMemo(
    () => [
      {
        name: 'name',
        label: 'form.name',
        placeholder: 'form.namePlaceholder',
        type: 'text' as const,
      },
      {
        name: 'redirectUris',
        label: 'form.redirectUris',
        placeholder: 'form.redirectUrisPlaceholder',
        type: 'actions' as const,
      },
      {
        name: 'allowSignUp',
        label: 'form.allowSignUp',
        type: 'switch' as const,
      },
      {
        name: 'signUpRoleId',
        label: 'form.signUpRole',
        placeholder: 'form.signUpRolePlaceholder',
        type: 'select' as const,
        options: signUpRoleOptions,
        showWhen: { field: 'allowSignUp', value: true },
      },
    ],
    [signUpRoleOptions]
  );

  if (!scope || !canCreate || requiresEmailVerification) return null;

  const handleOpenChange = (newOpen: boolean) => {
    setIsDialogOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleCreate = async (values: ProjectAppCreateFormValues) => {
    const result = await createProjectApp({
      scope: scope!,
      name: values.name?.trim() || undefined,
      redirectUris: values.redirectUris,
      scopes: values.scopes ?? [],
      enabledProviders: values.enabledProviders?.length ? values.enabledProviders : undefined,
      allowSignUp: values.allowSignUp,
      signUpRoleId:
        values.allowSignUp === false ? null : values.signUpRoleId ? values.signUpRoleId : undefined,
      tagIds: values.tagIds?.length ? values.tagIds : undefined,
      primaryTagId: values.primaryTagId || undefined,
    });

    if (result) {
      (onProjectAppCreated ?? handleProjectAppCreated)(result);
    }
  };

  return (
    <CreateDialog<ProjectAppCreateFormValues>
      open={open !== undefined ? open : isDialogOpen}
      icon={LayoutGrid}
      schema={createProjectAppSchema}
      defaultValues={defaultValues}
      fields={fields}
      relationships={relationships}
      title="createDialog.title"
      description="createDialog.description"
      triggerText="createDialog.trigger"
      confirmText="createDialog.confirm"
      cancelText="createDialog.cancel"
      translationNamespace="projectApps"
      submittingText="createDialog.submitting"
      onCreate={handleCreate}
      onOpenChange={handleOpenChange}
      triggerAlwaysShowLabel={triggerAlwaysShowLabel}
    />
  );
}
