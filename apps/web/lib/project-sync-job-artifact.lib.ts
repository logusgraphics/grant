import type { Scope } from '@grantjs/schema';

import { getApiBaseUrl } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';

export type ProjectSyncJobArtifactKind = 'payload' | 'snapshot';

export function buildProjectSyncJobArtifactUrl(
  projectId: string,
  jobId: string,
  scope: Scope,
  kind: ProjectSyncJobArtifactKind
): string {
  const apiBase = getApiBaseUrl();
  const search = new URLSearchParams({ scopeId: scope.id, tenant: scope.tenant });
  return `${apiBase}/api/projects/${projectId}/sync/jobs/${jobId}/${kind}?${search.toString()}`;
}

export async function fetchProjectSyncJobArtifact<T>(
  url: string,
  kind: ProjectSyncJobArtifactKind
): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      accept: 'application/json',
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
    },
  });
  if (!res.ok) {
    const bodyText = await res.text().catch(() => res.statusText);
    throw new Error(bodyText || `Failed to load ${kind} (${res.status})`);
  }
  return (await res.json()) as T;
}

export function downloadJsonArtifact(content: unknown, filename: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
