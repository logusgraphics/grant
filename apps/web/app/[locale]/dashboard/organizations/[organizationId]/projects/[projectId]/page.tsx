'use client';

import { useEffect } from 'react';

import { useParams } from 'next/navigation';

import { useRouter } from '@/i18n/navigation';

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const organizationId = params.organizationId as string;
  const projectId = params.projectId as string;
  useEffect(() => {
    router.push(`/dashboard/organizations/${organizationId}/projects/${projectId}/users`);
  }, [organizationId, projectId, router]);
}
