'use client';

import { useEffect } from 'react';
import { AccountType } from '@grantjs/schema';

import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth.store';

interface OrganizationLayoutProps {
  children: React.ReactNode;
}

export default function OrganizationLayout({ children }: OrganizationLayoutProps) {
  const { getCurrentAccount, loading } = useAuthStore();
  const currentAccount = getCurrentAccount();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (currentAccount && currentAccount.type === AccountType.Personal) {
      router.push(`/dashboard/accounts/${currentAccount.id}`);
    }
  }, [currentAccount, loading, router]);

  return children;
}
