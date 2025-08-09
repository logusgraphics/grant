'use client';

import { redirect } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function DashboardPage() {
  const currentLocale = useLocale();
  redirect(`/${currentLocale}/dashboard/organizations`);
}
