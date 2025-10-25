'use client';

import { useEffect } from 'react';

import { useLocale } from 'next-intl';

import { AuthPageLayout } from '@/components/layout/AuthPageLayout';
import { useAuthStore } from '@/stores/auth.store';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { loading, currentAccount } = useAuthStore();
  const locale = useLocale();

  useEffect(() => {
    if (loading) return;
    if (currentAccount) {
      window.location.href = `/${locale}/dashboard`;
    }
  }, [currentAccount, locale, loading]);

  return <AuthPageLayout>{children}</AuthPageLayout>;
}
