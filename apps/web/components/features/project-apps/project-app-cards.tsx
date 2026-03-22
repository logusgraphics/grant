'use client';

import { useTranslations } from 'next-intl';
import { TagColor } from '@grantjs/constants';
import type { ProjectApp, Tag } from '@grantjs/schema';
import {
  CopyCheck,
  Fingerprint,
  LayoutGrid,
  Link2,
  LogIn,
  Shield,
  Tags,
  UserPlus,
} from 'lucide-react';

import { CardBody, CardGrid, CardHeader, CopyToClipboard, ScrollBadges } from '@/components/common';
import { useScopeFromParams } from '@/hooks/common';
import { transformTagsToBadges } from '@/lib/tag';
import { useProjectAppsStore } from '@/stores/project-apps.store';

import { ProjectAppActions } from './project-app-actions';
import { ProjectAppAudit } from './project-app-audit';
import { ProjectAppCardSkeleton } from './project-app-card-skeleton';
import { ProjectAppCreateDialog } from './project-app-create-dialog';

export function ProjectAppCards() {
  const t = useTranslations('projectApps');
  const scope = useScopeFromParams();
  const projectApps = useProjectAppsStore((state) => state.projectApps);
  const loading = useProjectAppsStore((state) => state.loading);
  const search = useProjectAppsStore((state) => state.search);
  const limit = useProjectAppsStore((state) => state.limit);

  const hasActiveFilters = search.trim() !== '';

  if (!scope) return null;

  return (
    <CardGrid<ProjectApp>
      entities={projectApps}
      loading={loading}
      emptyState={{
        icon: <LayoutGrid />,
        title: hasActiveFilters ? t('noSearchResults.title') : t('empty.title'),
        description: hasActiveFilters ? t('noSearchResults.description') : t('empty.description'),
        action: hasActiveFilters ? undefined : <ProjectAppCreateDialog triggerAlwaysShowLabel />,
      }}
      skeleton={{
        component: <ProjectAppCardSkeleton />,
        count: limit,
      }}
      renderHeader={(app: ProjectApp) => (
        <CardHeader
          avatar={{
            initial: (app.name || app.clientId).charAt(0),
            size: 'lg',
          }}
          title={app.name || app.clientId}
          color={app.tags?.find((tag: Tag) => tag.isPrimary)?.color as TagColor}
          actions={<ProjectAppActions projectApp={app} scope={scope} />}
        />
      )}
      renderBody={(app: ProjectApp) => {
        const signUpRole = (app as { signUpRole?: { id: string; name: string } | null }).signUpRole;
        const allowSignUp = app.allowSignUp ?? true;
        return (
          <CardBody
            items={[
              {
                label: {
                  icon: <Fingerprint className="h-3 w-3" />,
                  text: t('table.clientId'),
                },
                value: (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-mono truncate">
                      {app.clientId}
                    </span>
                    <CopyToClipboard text={app.clientId} size="sm" variant="ghost" />
                  </div>
                ),
              },
              {
                label: {
                  icon: <UserPlus className="h-3 w-3" />,
                  text: t('table.allowSignUp'),
                },
                value: (
                  <span className="text-sm text-muted-foreground">
                    {allowSignUp ? t('common.yes') : t('common.no')}
                  </span>
                ),
              },
              ...(allowSignUp && signUpRole
                ? [
                    {
                      label: {
                        icon: <Shield className="h-3 w-3" />,
                        text: t('table.signUpRole'),
                      },
                      value: (
                        <span className="text-sm text-muted-foreground">{signUpRole.name}</span>
                      ),
                    },
                  ]
                : []),
              {
                label: {
                  icon: <Link2 className="h-3 w-3" />,
                  text: t('table.redirectUris'),
                },
                value: (
                  <ScrollBadges
                    items={
                      app.redirectUris?.map((uri) => ({
                        id: uri,
                        label: uri,
                      })) ?? []
                    }
                    height={60}
                  />
                ),
              },
              {
                label: {
                  icon: <LogIn className="h-3 w-3" />,
                  text: t('table.enabledProviders'),
                },
                value: (
                  <ScrollBadges
                    items={
                      app.enabledProviders?.map((p) => ({
                        id: p,
                        label: t(`providers.${p}` as 'providers.email' | 'providers.github'),
                      })) ?? []
                    }
                    height={60}
                  />
                ),
              },
              {
                label: {
                  icon: <CopyCheck className="h-3 w-3" />,
                  text: t('table.scopes'),
                },
                value: (
                  <ScrollBadges
                    items={
                      app.scopes?.map((scope) => ({
                        id: scope,
                        label: scope,
                      })) ?? []
                    }
                    height={60}
                  />
                ),
              },
              {
                label: {
                  icon: <Tags className="h-3 w-3" />,
                  text: t('table.tags'),
                },
                value: (
                  <ScrollBadges
                    items={transformTagsToBadges(app.tags)}
                    height={60}
                    showAsRound={true}
                  />
                ),
              },
            ]}
          />
        );
      }}
      renderFooter={(app: ProjectApp) => <ProjectAppAudit projectApp={app} />}
    />
  );
}
