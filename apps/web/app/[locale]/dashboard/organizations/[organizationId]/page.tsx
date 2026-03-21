'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AccountType } from '@grantjs/schema';

import { FullPageLoader } from '@/components/common';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function OrganizationPage() {
  const { getCurrentAccount, loading, clearAuth } = useAuthStore();
  const currentAccount = getCurrentAccount();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (loading) return;
    if (currentAccount && currentAccount.type === AccountType.Organization) {
      const organizationId = params.organizationId as string;
      router.push(`/dashboard/organizations/${organizationId}/projects`);
    }
  }, [params, currentAccount, loading, clearAuth, router]);

  return <FullPageLoader />;
}
