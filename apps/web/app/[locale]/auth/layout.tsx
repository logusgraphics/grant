'use client';

import { AuthLayout as AuthLayoutComponent } from '@/components/layout';

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Wraps auth pages (login, register, etc.). Redirect when authenticated and
 * ?redirect= persistence are handled centrally in SessionRestoreGate.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return <AuthLayoutComponent>{children}</AuthLayoutComponent>;
}
