import { Toolbar } from '@/components/common';

import { CreateOrganizationDialog } from './CreateOrganizationDialog';
import { OrganizationLimit } from './OrganizationLimit';
import { OrganizationSearch } from './OrganizationSearch';
import { OrganizationSorter } from './OrganizationSorter';
import { OrganizationTagSelector } from './OrganizationTagSelector';
import { OrganizationViewSwitcher } from './OrganizationViewSwitcher';

export function OrganizationToolbar() {
  const toolbarItems = [
    <OrganizationSearch key="search" />,
    <OrganizationSorter key="sorter" />,
    <OrganizationTagSelector key="tags" />,
    <OrganizationLimit key="limit" />,
    <OrganizationViewSwitcher key="view" />,
    <CreateOrganizationDialog key="create" />,
  ];

  return <Toolbar items={toolbarItems} />;
}
