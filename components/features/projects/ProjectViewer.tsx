'use client';

import { useProjectsStore } from '@/stores/projects.store';

import { ProjectCards } from './ProjectCards';
import { ProjectTable } from './ProjectTable';
import { ProjectView } from './ProjectViewSwitcher';

export function ProjectViewer() {
  const view = useProjectsStore((state) => state.view);

  // Render the appropriate view based on the current view state
  switch (view) {
    case ProjectView.CARD:
      return <ProjectCards />;
    case ProjectView.TABLE:
      return <ProjectTable />;
    default:
      return <ProjectCards />;
  }
}
