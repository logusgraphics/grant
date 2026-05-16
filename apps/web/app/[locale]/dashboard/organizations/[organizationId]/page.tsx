'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AccountType } from '@grantjs/schema';

import { FullPageLoader } from '@/components/common';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function OrganizationPage() {
  const { getCurrentAccount, loading } = useAuthStore();
  const currentAccount = getCurrentAccount();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  useEffect(() => {
    if (loading) return;
    if (!currentAccount || currentAccount.type !== AccountType.Organization) return;
    const organizationId = params.organizationId as string;
    const hub = `/dashboard/organizations/${organizationId}`;
    if (pathname !== hub && pathname !== `${hub}/`) return;
    router.push(`${hub}/projects`);
  }, [params, currentAccount, loading, router, pathname]);

  return <FullPageLoader />;
}
