'use client';

import { useEffect } from 'react';

import { useRouter } from '@/i18n/navigation';

export default function SettingsPage() {
  const router = useRouter();
  useEffect(() => {
    router.push(`/dashboard/settings/account`);
  }, [router]);
}
