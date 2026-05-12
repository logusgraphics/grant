'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

import { usePathname, useRouter } from '@/i18n/navigation';

export default function PersonalProjectPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const accountId = params.accountId as string;
  const projectId = params.projectId as string;

  useEffect(() => {
    const target = `/dashboard/accounts/${accountId}/projects/${projectId}/users`;
    if (pathname === target || pathname.startsWith(`${target}/`)) return;
    router.push(target);
  }, [accountId, projectId, pathname, router]);
}
