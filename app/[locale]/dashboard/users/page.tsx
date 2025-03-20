import { UserList } from '@/components/UserList';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import { getTranslations } from 'next-intl/server';

export default async function UsersPage() {
  const t = await getTranslations();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('users.title')}</h2>
        <CreateUserDialog />
      </div>
      <UserList />
    </div>
  );
}
