'use client';

import { OrganizationInvitationStatus } from '@logusgraphics/grant-schema';
import { UserCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Avatar } from '@/components/common/Avatar';
import { DataTable, type ColumnConfig } from '@/components/common/DataTable';
import { type ColumnConfig as SkeletonColumnConfig } from '@/components/common/TableSkeleton';
import { Badge } from '@/components/ui/badge';
import { MemberWithInvitation } from '@/hooks/members';
import { useMembersStore } from '@/stores/members.store';

import { MemberActions } from './MemberActions';
import { MemberAudit } from './MemberAudit';

export function MemberTable() {
  const t = useTranslations('members');

  const limit = useMembersStore((state) => state.limit);
  const search = useMembersStore((state) => state.search);
  const members = useMembersStore((state) => state.members);
  const loading = useMembersStore((state) => state.loading);

  const getStatusBadge = (status?: OrganizationInvitationStatus) => {
    if (!status) return null;

    const config = {
      [OrganizationInvitationStatus.Pending]: {
        color: 'text-muted-foreground',
        label: t('status.pending'),
      },
      [OrganizationInvitationStatus.Accepted]: {
        color: 'text-green-600',
        label: t('status.accepted'),
      },
      [OrganizationInvitationStatus.Expired]: {
        color: 'text-orange-500',
        label: t('status.expired'),
      },
      [OrganizationInvitationStatus.Revoked]: {
        color: 'text-destructive',
        label: t('status.revoked'),
      },
    };

    const { color, label } = config[status];

    return <span className={`text-sm ${color} flex items-center gap-1`}>{label}</span>;
  };

  const columns: ColumnConfig<MemberWithInvitation>[] = [
    {
      key: 'avatar',
      header: '',
      width: '60px',
      className: 'pl-4',
      render: (member: MemberWithInvitation) => (
        <Avatar initial={member.name.charAt(0)} size="md" />
      ),
    },
    {
      key: 'name',
      header: t('table.name'),
      width: '240px',
      render: (member: MemberWithInvitation) => (
        <span className="text-sm font-medium">{member.name}</span>
      ),
    },
    {
      key: 'email',
      header: t('table.email'),
      width: '240px',
      render: (member: MemberWithInvitation) =>
        member.email ? (
          <span className="text-sm text-muted-foreground">{member.email}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      key: 'role',
      header: t('table.role'),
      width: '200px',
      render: (member: MemberWithInvitation) => {
        return <Badge variant="outline">{t(member.role?.name as string)}</Badge>;
      },
    },
    {
      key: 'status',
      header: t('table.status'),
      width: '150px',
      render: (member: MemberWithInvitation) =>
        member.type === 'member' ? (
          <span className="text-sm text-green-600">{t('status.active')}</span>
        ) : (
          getStatusBadge(member.status)
        ),
    },
    {
      key: 'audit',
      header: t('table.audit'),
      width: '200px',
      render: (member: MemberWithInvitation) => <MemberAudit member={member} />,
    },
  ];

  const skeletonConfig: { columns: SkeletonColumnConfig[]; rowCount?: number } = {
    columns: [
      { key: 'avatar', type: 'avatar-only' },
      { key: 'name', type: 'text' },
      { key: 'email', type: 'text' },
      { key: 'role', type: 'badge' },
      { key: 'status', type: 'badge' },
      { key: 'audit', type: 'text' },
    ],
    rowCount: limit,
  };

  return (
    <DataTable
      data={members}
      columns={columns}
      loading={loading}
      emptyState={{
        icon: <UserCheck className="h-12 w-12" />,
        title: search ? t('noSearchResults.title') : t('empty.title'),
        description: search ? t('noSearchResults.description') : t('empty.description'),
      }}
      actionsColumn={{
        render: (member) => <MemberActions member={member} />,
      }}
      skeletonConfig={skeletonConfig}
    />
  );
}
