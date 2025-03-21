'use client';

import { UserList } from '@/components/UserList';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import { useTranslations } from 'next-intl';

export default function UsersPage() {
  const t = useTranslations('users');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <CreateUserDialog currentPage={1} />
      </div>
      <UserList />
    </div>
  );
}
