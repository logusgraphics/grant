'use client';

import { ReactNode, useEffect } from 'react';

import { useLocale } from 'next-intl';

import { EmailVerificationBanner } from '@/components/common';
import { useAccountsSync } from '@/hooks/accounts';
import { useAuthStore } from '@/stores/auth.store';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const {
    isAuthenticated,
    clearAuth,
    loading,
    email,
    requiresEmailVerification,
    verificationExpiry,
  } = useAuthStore();
  const locale = useLocale();

  useAccountsSync();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated()) {
      clearAuth();
      window.location.href = `/${locale}/auth/login`;
    }
  }, [isAuthenticated, locale, clearAuth, loading]);

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        {requiresEmailVerification && email && (
          <EmailVerificationBanner email={email} expiresAt={verificationExpiry} />
        )}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
