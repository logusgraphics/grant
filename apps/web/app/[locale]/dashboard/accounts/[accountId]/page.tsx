'use client';

import { useEffect } from 'react';
import { AccountType } from '@grantjs/schema';

import { FullPageLoader } from '@/components/common';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function AccountPage() {
  const { getCurrentAccount, loading } = useAuthStore();
  const currentAccount = getCurrentAccount();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!currentAccount || currentAccount.type !== AccountType.Personal) return;
    const hub = `/dashboard/accounts/${currentAccount.id}`;
    if (pathname !== hub && pathname !== `${hub}/`) return;
    router.push(`${hub}/projects`);
  }, [currentAccount, loading, router, pathname]);

  return <FullPageLoader />;
}
