'use client';

import { useGrant } from '@grantjs/client/react';
import { ResourceAction, ResourceSlug } from '@grantjs/constants';
import { ApiKeySortableField, SortOrder } from '@grantjs/schema';

import { RefreshButton, Toolbar } from '@/components/common';
import { useScopeFromParams } from '@/hooks/common';
import { useApiKeysStore } from '@/stores/api-keys.store';

import { ApiKeyCreateDialog } from './api-key-create-dialog';
import { ApiKeySearch } from './api-key-search';
import { ApiKeySorter } from './api-key-sorter';
import { ApiKeyViewSwitcher } from './api-key-view-switcher';

export function ApiKeyToolbar() {
  const scope = useScopeFromParams();
  const refetch = useApiKeysStore((state) => state.refetch);
  const loading = useApiKeysStore((state) => state.loading);
  const search = useApiKeysStore((state) => state.search);
  const sort = useApiKeysStore((state) => state.sort);
  const totalCount = useApiKeysStore((state) => state.totalCount);
  const setSearch = useApiKeysStore((state) => state.setSearch);
  const setSort = useApiKeysStore((state) => state.setSort);
  const handleApiKeyCreated = useApiKeysStore((state) => state.handleApiKeyCreated);

  const canCreate = useGrant(ResourceSlug.ApiKey, ResourceAction.Create, {
    scope: scope!,
  });

  const limit = useApiKeysStore((state) => state.limit);
  const totalPages = Math.ceil(totalCount / limit);
  const handleSortChange = (field: ApiKeySortableField, order: SortOrder) => {
    setSort(field, order);
  };

  const toolbarItems = [
    <RefreshButton key="refresh" onRefresh={refetch ?? undefined} loading={loading} />,
    (totalPages > 1 || search.length > 0) && (
      <ApiKeySearch key="search" search={search} onSearchChange={setSearch} />
    ),
    totalCount > 0 && <ApiKeySorter key="sorter" sort={sort} onSortChange={handleSortChange} />,
    <ApiKeyViewSwitcher key="view" />,
    ...(canCreate
      ? [<ApiKeyCreateDialog key="create" onApiKeyCreated={handleApiKeyCreated} />]
      : []),
  ].filter(Boolean);

  return <Toolbar items={toolbarItems} />;
}
