'use client';

import { useEffect } from 'react';
import { AccountType } from '@grantjs/schema';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth.store';

interface OrganizationLayoutProps {
  children: React.ReactNode;
}

export default function OrganizationLayout({ children }: OrganizationLayoutProps) {
  const { getCurrentAccount, loading } = useAuthStore();
  const currentAccount = getCurrentAccount();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!currentAccount || currentAccount.type !== AccountType.Personal) return;
    if (!pathname.startsWith('/dashboard/organizations')) return;
    router.push(`/dashboard/accounts/${currentAccount.id}`);
  }, [currentAccount, loading, router, pathname]);

  return children;
}
