'use client';

import { useEffect } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const hub = '/dashboard/settings';
    const normalized = pathname.replace(/\/$/, '') || '/';
    if (normalized !== hub) return;
    router.push(`/dashboard/settings/account`);
  }, [pathname, router]);
}
