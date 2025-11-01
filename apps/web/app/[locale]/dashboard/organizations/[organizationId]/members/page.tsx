'use client';

import { useParams } from 'next/navigation';

import { useTranslations } from 'next-intl';

import { DashboardPageLayout } from '@/components/common/dashboard/DashboardPageLayout';
import { MemberPagination, MemberToolbar, MemberViewer } from '@/components/features/members';
import { usePageTitle } from '@/hooks';

export default function OrganizationMembersPage() {
  const t = useTranslations('members');
  const params = useParams();
  const organizationId = params.organizationId as string;
  usePageTitle('members');

  return (
    <DashboardPageLayout
      title={t('title')}
      actions={<MemberToolbar organizationId={organizationId} />}
      footer={<MemberPagination />}
    >
      <MemberViewer organizationId={organizationId} />
    </DashboardPageLayout>
  );
}
