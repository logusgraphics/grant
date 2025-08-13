'use client';

import { useEffect } from 'react';

import { useOrganizations } from '@/hooks/organizations';
import { useOrganizationsStore } from '@/stores/organizations.store';

import { OrganizationCards } from './OrganizationCards';
import { OrganizationTable } from './OrganizationTable';
import { OrganizationView } from './OrganizationViewSwitcher';

export function OrganizationViewer() {
  // Use selective subscriptions to prevent unnecessary re-renders
  const view = useOrganizationsStore((state) => state.view);
  const page = useOrganizationsStore((state) => state.page);
  const limit = useOrganizationsStore((state) => state.limit);
  const search = useOrganizationsStore((state) => state.search);
  const sort = useOrganizationsStore((state) => state.sort);
  const selectedTagIds = useOrganizationsStore((state) => state.selectedTagIds);
  const setTotalCount = useOrganizationsStore((state) => state.setTotalCount);
  const setOrganizations = useOrganizationsStore((state) => state.setOrganizations);
  const setLoading = useOrganizationsStore((state) => state.setLoading);

  // Get organizations data from the hook
  const { organizations, loading, totalCount } = useOrganizations({
    page,
    limit,
    search,
    sort,
    tagIds: selectedTagIds,
  });

  // Update store with data when it changes
  useEffect(() => {
    setOrganizations(organizations);
  }, [organizations, setOrganizations]);

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  // Update store with total count when data changes
  useEffect(() => {
    if (totalCount && totalCount !== 0) {
      setTotalCount(totalCount);
    }
  }, [totalCount, setTotalCount]);

  switch (view) {
    case OrganizationView.CARD:
      return <OrganizationCards />;
    case OrganizationView.TABLE:
    default:
      return <OrganizationTable />;
  }
}
