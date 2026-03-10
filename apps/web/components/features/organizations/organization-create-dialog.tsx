'use client';

import { useGrant } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';
import { Building2 } from 'lucide-react';
import { DefaultValues } from 'react-hook-form';

import { CreateDialog, DialogField } from '@/components/common';
import { useRequiresEmailVerificationForMutation } from '@/hooks/auth';
import { useAccountScope } from '@/hooks/common/use-account-scope';
import { useOrganizationMutations } from '@/hooks/organizations';
import { useOrganizationsStore } from '@/stores/organizations.store';

import { CreateOrganizationFormValues, createOrganizationSchema } from './organization-types';

interface OrganizationCreateDialogProps {
  /** When true, no trigger is rendered; dialog is opened only via store (e.g. from organization switcher). */
  hideTrigger?: boolean;
  /** When true, trigger label is always visible (e.g. empty state). When false/undefined, toolbar responsive behavior. */
  triggerAlwaysShowLabel?: boolean;
}

export function OrganizationCreateDialog({
  hideTrigger,
  triggerAlwaysShowLabel,
}: OrganizationCreateDialogProps = {}) {
  const { createOrganization } = useOrganizationMutations();
  const scope = useAccountScope();

  const canCreate = useGrant(ResourceSlug.Organization, ResourceAction.Create, {
    scope: scope!,
  });
  const requiresEmailVerification = useRequiresEmailVerificationForMutation(scope);

  const isCreateDialogOpen = useOrganizationsStore((state) => state.isCreateDialogOpen);
  const setCreateDialogOpen = useOrganizationsStore((state) => state.setCreateDialogOpen);

  // Block if user doesn't have permission OR email verification is required but not completed
  if (!scope || !canCreate || requiresEmailVerification) {
    return null;
  }

  const fields: DialogField[] = [
    {
      name: 'name',
      label: 'form.name',
      placeholder: 'form.name',
      type: 'text',
    },
  ];

  const defaultValues: DefaultValues<CreateOrganizationFormValues> = {
    name: '',
    tagIds: [],
  };

  const handleCreate = async (values: CreateOrganizationFormValues) => {
    await createOrganization({
      scope: scope!,
      name: values.name,
    });
  };

  const handleOpenChange = (open: boolean) => {
    setCreateDialogOpen(open);
  };

  return (
    <CreateDialog
      open={isCreateDialogOpen}
      icon={Building2}
      schema={createOrganizationSchema}
      defaultValues={defaultValues}
      fields={fields}
      title="createDialog.title"
      description="createDialog.description"
      triggerText="createDialog.trigger"
      confirmText="createDialog.confirm"
      cancelText="deleteDialog.cancel"
      translationNamespace="organizations"
      submittingText="createDialog.submitting"
      onCreate={handleCreate}
      onOpenChange={handleOpenChange}
      triggerAlwaysShowLabel={triggerAlwaysShowLabel}
      hideTrigger={hideTrigger}
    />
  );
}
