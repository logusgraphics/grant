'use client';

import { UserList } from '@/components/features/users/UserList';
import { CreateUserDialog } from '@/components/features/users/CreateUserDialog';
import { useTranslations } from 'next-intl';
import { DashboardPageTitle } from '@/components/common/DashboardPageTitle';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function UsersPage() {
  const t = useTranslations('users');
  usePageTitle('users');

  return (
    <div className="space-y-8">
      <DashboardPageTitle title={t('title')} actions={<CreateUserDialog currentPage={1} />} />
      <UserList />
    </div>
  );
}
