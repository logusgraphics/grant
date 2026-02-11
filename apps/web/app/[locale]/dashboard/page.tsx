'use client';

import { useEffect } from 'react';

import { FullPageLoader } from '@/components/common';
import { useRouter } from '@/i18n/navigation';
import { getRedirectPath } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth.store';

export default function DashboardPage() {
  const { getCurrentAccount, clearAuth, loading } = useAuthStore();
  const currentAccount = getCurrentAccount();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (currentAccount) {
      const redirectTo = getRedirectPath(currentAccount.type, currentAccount.id);
      router.push(redirectTo);
    }
  }, [currentAccount, clearAuth, loading, router]);

  return <FullPageLoader />;
}
