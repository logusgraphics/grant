'use client';

import { useParams } from 'next/navigation';

import { Scope, Tenant } from '@/graphql/generated/types';
import { useOrganizationsStore } from '@/stores/organizations.store';

export function useScopeFromParams(): Scope {
  const params = useParams();
  const selectedOrganizationId = useOrganizationsStore((state) => state.selectedOrganizationId);

  if (params.projectId) {
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

  return {
    tenant: Tenant.Organization,
    id: selectedOrganizationId || '1',
  };
}
