'use client';

import { useTranslations } from 'next-intl';

import { CardHeader } from '@/components/common';
import { Project } from '@/graphql/generated/types';

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const t = useTranslations('projects');

  return (
    <CardHeader
      avatar={{
        initial: project.name.charAt(0).toUpperCase(),
      }}
      title={project.name}
      description={project.description || t('card.noDescription')}
    />
  );
}
