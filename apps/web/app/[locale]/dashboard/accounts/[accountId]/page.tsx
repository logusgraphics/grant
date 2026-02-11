'use client';

import { useEffect } from 'react';

import { AccountType } from '@grantjs/schema';

import { FullPageLoader } from '@/components/common';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function AccountPage() {
  const { getCurrentAccount, loading } = useAuthStore();
  const currentAccount = getCurrentAccount();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (currentAccount && currentAccount.type === AccountType.Personal) {
      router.push(`/dashboard/accounts/${currentAccount.id}/projects`);
    }
  }, [currentAccount, loading, router]);

  return <FullPageLoader />;
}
