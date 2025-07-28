'use client';

import { Group } from '@/graphql/generated/types';
import { EnhancedDataTable, type FieldConfig } from '@/components/common/DataTable';
import { type ColumnConfig } from '@/components/common/TableSkeleton';
import { GroupActions } from './GroupActions';
import { CreateGroupDialog } from './CreateGroupDialog';
import { Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface GroupTableProps {
  limit: number;
  groups: Group[];
  loading: boolean;
  search: string;
  onEditClick: (group: Group) => void;
  onDeleteClick: (group: Group) => void;
}

export function GroupTable({
  limit,
  groups,
  loading,
  search,
  onEditClick,
  onDeleteClick,
}: GroupTableProps) {
  const t = useTranslations('groups');

  const fields: FieldConfig<Group>[] = [
    {
      type: 'id',
      key: 'id',
      header: t('table.id'),
      width: '120px',
    },
    {
      type: 'avatar',
      key: 'name',
      header: t('table.name'),
      width: '300px',
      avatar: {
        getInitial: (group: Group) => group.name.charAt(0).toUpperCase(),
        defaultBackgroundClass: 'bg-primary/10',
        size: 'md',
      },
    },
    {
      type: 'description',
      key: 'description',
      header: t('table.description'),
      width: '250px',
    },
    {
      type: 'list',
      key: 'permissions',
      header: t('permissions'),
      width: '200px',
      list: {
        items: (group: Group) => group.permissions || [],
        labelField: 'name',
        icon: <Shield className="h-3 w-3" />,
        height: 60,
        maxItems: 3,
      },
    },
    {
      type: 'timestamp',
      key: 'createdAt',
      header: t('table.created'),
      width: '150px',
    },
    {
      type: 'timestamp',
      key: 'updatedAt',
      header: t('table.updated'),
      width: '150px',
    },
  ];

  const skeletonConfig: { columns: ColumnConfig[]; rowCount?: number } = {
    columns: [
      { key: 'id', type: 'text' },
      { key: 'name', type: 'avatar' },
      { key: 'description', type: 'text' },
      { key: 'permissions', type: 'list' },
      { key: 'createdAt', type: 'text' },
      { key: 'updatedAt', type: 'text' },
    ],
    rowCount: limit,
  };

  return (
    <EnhancedDataTable
      data={groups}
      fields={fields}
      loading={loading}
      emptyState={{
        icon: <Shield className="h-12 w-12" />,
        title: search ? t('noSearchResults.title') : t('noGroups.title'),
        description: search ? t('noSearchResults.description') : t('noGroups.description'),
        action: search ? undefined : <CreateGroupDialog />,
      }}
      actionsColumn={{
        render: (group) => (
          <GroupActions group={group} onEditClick={onEditClick} onDeleteClick={onDeleteClick} />
        ),
      }}
      skeletonConfig={skeletonConfig}
    />
  );
}
