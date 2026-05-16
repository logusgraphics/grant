'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

import { usePathname, useRouter } from '@/i18n/navigation';

export default function ProjectPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const organizationId = params.organizationId as string;
  const projectId = params.projectId as string;

  useEffect(() => {
    const target = `/dashboard/organizations/${organizationId}/projects/${projectId}/users`;
    if (pathname === target || pathname.startsWith(`${target}/`)) return;
    router.push(target);
  }, [organizationId, projectId, pathname, router]);
}
