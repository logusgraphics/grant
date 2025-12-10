'use client';

import { useState } from 'react';

import { ApiKey, Scope } from '@logusgraphics/grant-schema';
import { Ban, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Actions, type ActionItem } from '@/components/common';

import { DeleteApiKeyDialog } from './DeleteApiKeyDialog';
import { RevokeApiKeyDialog } from './RevokeApiKeyDialog';

interface ApiKeyActionsProps {
  apiKey: ApiKey;
  scope: Scope;
}

export function ApiKeyActions({ apiKey, scope }: ApiKeyActionsProps) {
  const t = useTranslations('user.apiKeys.actions');
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleRevokeClick = () => {
    if (apiKey.isRevoked) return;
    setRevokeDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const actions: ActionItem<ApiKey>[] = [];

  if (!apiKey.isRevoked) {
    actions.push({
      key: 'revoke',
      label: t('revoke'),
      icon: <Ban className="mr-2 h-4 w-4" />,
      onClick: handleRevokeClick,
      variant: 'destructive',
    });
  }

  actions.push({
    key: 'delete',
    label: t('delete'),
    icon: <Trash2 className="mr-2 h-4 w-4" />,
    onClick: handleDeleteClick,
    variant: 'destructive',
  });

  return (
    <>
      <Actions entity={apiKey} actions={actions} />
      {!apiKey.isRevoked && (
        <RevokeApiKeyDialog
          apiKey={apiKey}
          scope={scope}
          open={revokeDialogOpen}
          onOpenChange={setRevokeDialogOpen}
        />
      )}
      <DeleteApiKeyDialog
        apiKey={apiKey}
        scope={scope}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}
