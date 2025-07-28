'use client';

import { Role } from '@/graphql/generated/types';
import { DataTable, type TableColumn } from '@/components/common/DataTable';
import { RoleActions } from './RoleActions';
import { CreateRoleDialog } from './CreateRoleDialog';
import { ColoredList } from '@/components/ui/colored-list';
import { Shield, Group } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface RoleTableProps {
  roles: Role[];
  loading: boolean;
  search: string;
  onEditClick: (role: Role) => void;
  onDeleteClick: (role: Role) => void;
}

export function RoleTable({ roles, loading, search, onEditClick, onDeleteClick }: RoleTableProps) {
  const t = useTranslations('roles');

  const columns: TableColumn<Role>[] = [
    {
      key: 'name',
      header: t('table.label'),
      render: (role) => <span className="font-medium">{role.name}</span>,
    },
    {
      key: 'description',
      header: t('table.description'),
      render: (role) => role.description || t('noDescription'),
    },
    {
      key: 'groups',
      header: t('groups'),
      render: (role) => (
        <ColoredList
          items={role.groups}
          labelField="name"
          title=""
          icon={<Group className="h-3 w-3" />}
          height={60}
        />
      ),
    },
  ];

  return (
    <DataTable
      data={roles}
      columns={columns}
      loading={loading}
      search={search}
      emptyStateIcon={<Shield className="h-12 w-12" />}
      emptyStateTitle={search ? t('noSearchResults.title') : t('noRoles.title')}
      emptyStateDescription={search ? t('noSearchResults.description') : t('noRoles.description')}
      emptyStateAction={search ? undefined : <CreateRoleDialog />}
      loadingText={t('table.loading')}
      actionsColumn={{
        render: (role) => (
          <RoleActions role={role} onEditClick={onEditClick} onDeleteClick={onDeleteClick} />
        ),
      }}
    />
  );
}
