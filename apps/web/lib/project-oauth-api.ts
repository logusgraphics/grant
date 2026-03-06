import { getApiBaseUrl } from '@/lib/constants';

import type {
  ProjectAppPublicInfo,
  ProjectConsentInfo,
  ProjectConsentRedirectResult,
} from '@grantjs/schema';

// Re-export for consumers that need the types
export type { ProjectAppPublicInfo, ProjectConsentInfo } from '@grantjs/schema';

/** Response body shape from project OAuth API error responses. */
export interface ProjectOAuthApiErrorBody {
  code?: string;
  details?: string;
  error?: string;
  message?: string;
}

/**
 * Error thrown by project OAuth API calls (app-info, consent-info, approve, deny).
 * Carries status and body so the web layer can map HTTP status/codes to user-facing messages.
 */
export class ProjectOAuthApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: ProjectOAuthApiErrorBody = {}
  ) {
    super(message);
    this.name = 'ProjectOAuthApiError';
  }
}

/** @deprecated Use ProjectOAuthApiError. Kept for backward compatibility. */
export const ProjectAppInfoError = ProjectOAuthApiError;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ProjectOAuthApiErrorBody;
    throw new ProjectOAuthApiError(
      body.error ?? body.details ?? body.message ?? res.statusText,
      res.status,
      body
    );
  }
  const data = await res.json();
  return (data.success && data.data ? data.data : data) as T;
}

export async function getProjectAppPublicInfo(
  clientId: string,
  scope?: string | null,
  redirectUri?: string | null
): Promise<ProjectAppPublicInfo> {
  const apiBase = getApiBaseUrl();
  const params = new URLSearchParams({ client_id: clientId });
  if (scope?.trim()) params.set('scope', scope.trim());
  if (redirectUri?.trim()) params.set('redirect_uri', redirectUri.trim());
  const url = `${apiBase}/api/auth/project/app-info?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ProjectOAuthApiErrorBody;
    throw new ProjectOAuthApiError(body.error ?? body.details ?? res.statusText, res.status, body);
  }
  const data = await res.json();
  return (data.success && data.data ? data.data : data) as ProjectAppPublicInfo;
}

export async function getProjectConsentInfo(consentToken: string): Promise<ProjectConsentInfo> {
  const apiBase = getApiBaseUrl();
  const url = `${apiBase}/api/auth/project/consent-info?consent_token=${encodeURIComponent(consentToken)}`;
  return fetchJson<ProjectConsentInfo>(url);
}

export async function approveProjectConsent(
  consentToken: string
): Promise<ProjectConsentRedirectResult> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/api/auth/project/consent/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ consent_token: consentToken }),
  });
  const data = (await res.json().catch(() => ({}))) as ProjectOAuthApiErrorBody & {
    success?: boolean;
    data?: ProjectConsentRedirectResult;
  };
  if (!res.ok) {
    throw new ProjectOAuthApiError(
      data.error ?? data.details ?? data.message ?? 'Approve failed',
      res.status,
      data
    );
  }
  return (data.success && data.data ? data.data : data) as ProjectConsentRedirectResult;
}

export async function denyProjectConsent(
  consentToken: string
): Promise<ProjectConsentRedirectResult> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/api/auth/project/consent/deny`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ consent_token: consentToken }),
  });
  const data = (await res.json().catch(() => ({}))) as ProjectOAuthApiErrorBody & {
    success?: boolean;
    data?: ProjectConsentRedirectResult;
  };
  if (!res.ok) {
    throw new ProjectOAuthApiError(
      data.error ?? data.details ?? data.message ?? 'Deny failed',
      res.status,
      data
    );
  }
  return (data.success && data.data ? data.data : data) as ProjectConsentRedirectResult;
}
