'use client';

import { Group } from '@/graphql/generated/types';
import { DataTable, type TableColumn } from '@/components/common/DataTable';
import { GroupActions } from './GroupActions';
import { CreateGroupDialog } from './CreateGroupDialog';
import { ColoredList } from '@/components/ui/colored-list';
import { Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface GroupTableProps {
  groups: Group[];
  loading: boolean;
  search: string;
  onEditClick: (group: Group) => void;
  onDeleteClick: (group: Group) => void;
}

export function GroupTable({
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

  return (
    <DataTable
      data={groups}
      columns={columns}
      loading={loading}
      search={search}
      emptyStateIcon={<Shield className="h-12 w-12" />}
      emptyStateTitle={search ? t('noSearchResults.title') : t('noGroups.title')}
      emptyStateDescription={search ? t('noSearchResults.description') : t('noGroups.description')}
      emptyStateAction={search ? undefined : <CreateGroupDialog />}
      loadingText={t('table.loading')}
      actionsColumn={{
        render: (group) => (
          <GroupActions group={group} onEditClick={onEditClick} onDeleteClick={onDeleteClick} />
        ),
      }}
    />
  );
}
