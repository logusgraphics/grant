'use client';

import { FolderOpen, Tags } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CardGrid, ScrollBadges } from '@/components/common';
import { Project } from '@/graphql/generated/types';
import { useScopeFromParams } from '@/hooks/common/useScopeFromParams';
import { useProjects } from '@/hooks/projects';
import { transformTagsToBadges } from '@/lib/tag-utils';
import { useProjectsStore } from '@/stores/projects.store';

import { CreateProjectDialog } from './CreateProjectDialog';
import { ProjectAudit } from './ProjectAudit';
import { ProjectCardSkeleton } from './ProjectCardSkeleton';
import { ProjectHeader } from './ProjectHeader';
import { ProjectNavigationButton } from './ProjectNavigationButton';

export function ProjectCards() {
  const t = useTranslations('projects');
  const scope = useScopeFromParams();

  // Get store state
  const { page, limit, search, sort, selectedTagIds } = useProjectsStore();
  const { projects, loading } = useProjects({
    organizationId: scope.id,
    page,
    limit,
    search,
    sort,
    ids: undefined,
  });

  // Check if there are any active filters
  const hasActiveFilters = search.trim() !== '' || selectedTagIds.length > 0;

  return (
    <CardGrid<Project>
      entities={projects}
      loading={loading}
      emptyState={{
        icon: FolderOpen,
        title: hasActiveFilters ? t('noSearchResults.title') : t('empty.title'),
        description: hasActiveFilters ? t('noSearchResults.description') : t('empty.description'),
        action: hasActiveFilters ? undefined : <CreateProjectDialog />,
      }}
      skeleton={{
        component: <ProjectCardSkeleton />,
        count: limit,
      }}
      renderHeader={(project: Project) => <ProjectHeader project={project} />}
      renderBody={(project: Project) => (
        <div className="space-y-3">
          <ScrollBadges
            items={transformTagsToBadges(project.tags)}
            title={t('form.tags')}
            icon={<Tags className="h-3 w-3" />}
            height={60}
            showAsRound={true}
          />
        </div>
      )}
      renderFooter={(project: Project) => (
        <div className="flex items-center justify-between w-full">
          <ProjectAudit project={project} />
          <ProjectNavigationButton project={project} size="lg" round={true} />
        </div>
      )}
    />
  );
}
