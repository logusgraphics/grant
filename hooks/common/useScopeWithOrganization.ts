'use client';

import { useParams } from 'next/navigation';

import { Scope, Tenant } from '@/graphql/generated/types';
import { useOrganizationsStore } from '@/stores/organizations.store';

/**
 * Hook to extract scope from URL parameters with organization selection fallback.
 * Determines the tenant type and ID based on the current route.
 */
export function useScopeWithOrganization(): Scope {
  const params = useParams();
  const selectedOrganizationId = useOrganizationsStore((state) => state.selectedOrganizationId);

  // Check if we're in a project context
  if (params.projectId) {
    return {
      tenant: Tenant.Project,
      id: params.projectId as string,
    };
  }

  // Check if we're in an organization context
  if (params.organizationId) {
    return {
      tenant: Tenant.Organization,
      id: params.organizationId as string,
    };
  }

  // Fallback to selected organization or default
  // This should only happen on the main dashboard page
  return {
    tenant: Tenant.Organization,
    id: selectedOrganizationId || '1', // Use selected organization or default
  };
}
