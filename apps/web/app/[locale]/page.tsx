'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { FullPageLoader } from '@/components/common';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated()) {
      router.push('/dashboard');
      return;
    }
    const error = searchParams.get('error');
    const redirectPath = error ? `/auth/login?error=${encodeURIComponent(error)}` : '/auth/login';
    router.push(redirectPath);
  }, [isAuthenticated, loading, router, searchParams]);

  return <FullPageLoader />;
}
