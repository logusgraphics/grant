'use client';

import { Group } from '@/graphql/generated/types';
import { DataTable, type TableColumn } from '@/components/common/DataTable';
import { type ColumnConfig } from '@/components/common/TableSkeleton';
import { GroupActions } from './GroupActions';
import { CreateGroupDialog } from './CreateGroupDialog';
import { ColoredList } from '@/components/ui/colored-list';
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

  const columns: TableColumn<Group>[] = [
    {
      key: 'name',
      header: t('table.name'),
      render: (group) => <span className="font-medium">{group.name}</span>,
    },
    {
      key: 'description',
      header: t('table.description'),
      render: (group) => group.description || t('noDescription'),
    },
    {
      key: 'permissions',
      header: t('permissions'),
      render: (group) => (
        <ColoredList
          items={group.permissions || []}
          labelField="name"
          title=""
          icon={<Shield className="h-3 w-3" />}
          height={60}
        />
      ),
    },
  ];

  const skeletonConfig: { columns: ColumnConfig[]; rowCount?: number } = {
    columns: [
      { key: 'name', type: 'text' },
      { key: 'description', type: 'text' },
      { key: 'permissions', type: 'list' },
    ],
    rowCount: limit,
  };

  return (
    <DataTable
      data={groups}
      columns={columns}
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
