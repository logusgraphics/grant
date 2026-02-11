'use client';

import { useEffect } from 'react';

import { FullPageLoader } from '@/components/common';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const redirectPath = isAuthenticated() ? `/dashboard` : `/auth/login`;
    router.push(redirectPath);
  }, [isAuthenticated, loading, router]);

  return <FullPageLoader />;
}
