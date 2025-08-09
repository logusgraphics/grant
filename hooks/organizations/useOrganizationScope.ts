'use client';

import { useEffect } from 'react';

import { useParams } from 'next/navigation';

import { useOrganizationsStore } from '@/stores/organizations.store';

/**
 * Hook to handle organization scope and set selected organization ID
 * when navigating to organization pages
 */
export function useOrganizationScope() {
  const params = useParams();
  const setSelectedOrganizationId = useOrganizationsStore(
    (state) => state.setSelectedOrganizationId
  );
  const selectedOrganizationId = useOrganizationsStore((state) => state.selectedOrganizationId);

  useEffect(() => {
    // If we're on an organization page, set the selected organization ID
    if (params.organizationId) {
      const organizationId = params.organizationId as string;
      setSelectedOrganizationId(organizationId);
    }
  }, [params.organizationId, setSelectedOrganizationId]);

  return {
    selectedOrganizationId,
    setSelectedOrganizationId,
  };
}
