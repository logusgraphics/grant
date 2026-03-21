'use client';

import { useParams } from 'next/navigation';
import { Scope, Tenant } from '@grantjs/schema';

export function useProjectUserScope(): Scope | null {
  const params = useParams();

  if (params.projectId && params.organizationId) {
    return {
      tenant: Tenant.OrganizationProject,
      id: `${params.organizationId}:${params.projectId}` as string,
    };
  }

  if (params.projectId && params.accountId) {
    return {
      tenant: Tenant.AccountProject,
      id: `${params.accountId}:${params.projectId}` as string,
    };
  }

  return null;
}
