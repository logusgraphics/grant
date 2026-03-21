'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

import { useRouter } from '@/i18n/navigation';

export default function PersonalProjectPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.accountId as string;
  const projectId = params.projectId as string;
  useEffect(() => {
    router.push(`/dashboard/accounts/${accountId}/projects/${projectId}/users`);
  }, [accountId, projectId, router]);
}
