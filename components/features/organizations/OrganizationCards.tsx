'use client';

import { Building2, Tags } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CardGrid, CardHeader } from '@/components/common';
import { ScrollBadges } from '@/components/common';
import { Organization } from '@/graphql/generated/types';
import { transformTagsToBadges } from '@/lib/tag-utils';
import { useOrganizationsStore } from '@/stores/organizations.store';

import { CreateOrganizationDialog } from './CreateOrganizationDialog';
import { OrganizationActions } from './OrganizationActions';
import { OrganizationAudit } from './OrganizationAudit';
import { OrganizationCardSkeleton } from './OrganizationCardSkeleton';
import { OrganizationNavigationButton } from './OrganizationNavigationButton';

export function OrganizationCards() {
  const t = useTranslations('organizations');

  // Use selective subscriptions to prevent unnecessary re-renders
  const limit = useOrganizationsStore((state) => state.limit);
  const search = useOrganizationsStore((state) => state.search);
  const organizations = useOrganizationsStore((state) => state.organizations);
  const loading = useOrganizationsStore((state) => state.loading);

  return (
    <CardGrid<Organization>
      entities={organizations}
      loading={loading}
      emptyState={{
        icon: Building2,
        title: search ? t('noSearchResults.title') : t('noOrganizations.title'),
        description: search ? t('noSearchResults.description') : t('noOrganizations.description'),
        action: search ? undefined : <CreateOrganizationDialog />,
      }}
      skeleton={{
        component: <OrganizationCardSkeleton />,
        count: limit,
      }}
      renderHeader={(organization: Organization) => (
        <CardHeader
          avatar={{
            initial: organization.name.charAt(0),
            size: 'lg',
          }}
          title={organization.name}
          description={organization.slug}
          color={organization.tags?.[0]?.color}
          actions={<OrganizationActions organization={organization} />}
        />
      )}
      renderBody={(organization: Organization) => (
        <div className="space-y-3">
          <ScrollBadges
            items={transformTagsToBadges(organization.tags)}
            title={t('form.tags')}
            icon={<Tags className="h-3 w-3" />}
            height={60}
            showAsRound={true}
          />
        </div>
      )}
      renderFooter={(organization: Organization) => (
        <div className="flex items-center justify-between w-full">
          <OrganizationAudit organization={organization} />
          <OrganizationNavigationButton organization={organization} size="lg" round={true} />
        </div>
      )}
    />
  );
}
