'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const t = useTranslations('dashboard');
  const pathname = usePathname();

  return (
    <div className="w-full">
      <nav className="border-b px-8 h-14 flex items-center">
        <div className="absolute left-1/2 -translate-x-1/2 flex space-x-4">
          <Link
            href="/dashboard/users"
            className="text-sm font-medium transition-colors hover:text-primary data-[active]:bg-muted data-[active]:text-foreground px-3 py-1 rounded-md data-[active]:bg-accent"
            data-active={pathname.includes('/dashboard/users')}
          >
            {t('navigation.users')}
          </Link>
          {/* More navigation items will be added here */}
        </div>
      </nav>
      <div className="px-8 py-6">{children}</div>
    </div>
  );
}
