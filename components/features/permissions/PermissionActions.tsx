'use client';

import { Edit, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Actions, ActionItem } from '@/components/common';
import { Permission } from '@/graphql/generated/types';

interface PermissionActionsProps {
  permission: Permission;
  onEditClick: (permission: Permission) => void;
  onDeleteClick: (permission: Permission) => void;
}

export function PermissionActions({
  permission,
  onEditClick,
  onDeleteClick,
}: PermissionActionsProps) {
  const t = useTranslations('permissions.actions');

  const actions: ActionItem<Permission>[] = [
    {
      key: 'edit',
      label: t('edit'),
      icon: <Edit className="mr-2 h-4 w-4" />,
      onClick: onEditClick,
    },
    {
      key: 'delete',
      label: t('delete'),
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: onDeleteClick,
      variant: 'destructive',
    },
  ];

  return <Actions entity={permission} actions={actions} />;
}
