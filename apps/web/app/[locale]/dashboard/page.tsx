'use client';

import { useEffect } from 'react';

import { FullPageLoader } from '@/components/common';
import { usePathname, useRouter } from '@/i18n/navigation';
import { getRedirectPath } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth.store';

export default function DashboardPage() {
  const { getCurrentAccount, loading } = useAuthStore();
  const currentAccount = getCurrentAccount();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!currentAccount) return;
    // Only redirect from the bare dashboard hub; avoid re-pushing when `currentAccount`
    // reference changes after each syncFromMe (same id/type).
    if (pathname !== '/dashboard') return;
    const redirectTo = getRedirectPath(currentAccount.type, currentAccount.id);
    router.push(redirectTo);
  }, [currentAccount, loading, router, pathname]);

  return <FullPageLoader />;
}
