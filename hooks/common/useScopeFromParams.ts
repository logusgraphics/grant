'use client';

import { useParams } from 'next/navigation';

import { Scope, Tenant } from '@/graphql/generated/types';

export function useScopeFromParams(): Scope {
  const params = useParams();

  // With the new nested structure, we can always determine the scope from URL params
  if (params.projectId && params.organizationId) {
    return {
      tenant: Tenant.Project,
      id: params.projectId as string,
    };
  }

  if (params.organizationId) {
    return {
      tenant: Tenant.Organization,
      id: params.organizationId as string,
    };
  }

  // If no organization context is available, throw an error
  // This should not happen with the new nested structure
  throw new Error(
    'No organization context available. This should not happen with the new nested URL structure.'
  );
}
