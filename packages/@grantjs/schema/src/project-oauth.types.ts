/**
 * Project OAuth (REST) response types.
 * Used by project app-info and consent REST endpoints; shared by API and web client.
 */

/** Scope label returned by project app-info and consent-info endpoints. */
export interface ProjectAppScopeInfo {
  slug: string;
  name: string;
  description: string | null;
}

/** Response from GET /api/auth/project/app-info (public app metadata and scopes). */
export interface ProjectAppPublicInfo {
  name: string | null;
  enabledProviders: string[] | null;
  scopes: ProjectAppScopeInfo[];
}

/** User display info on the consent screen. */
export interface ProjectConsentInfoUser {
  displayName: string;
  email: string | null;
  pictureUrl: string | null;
}

/** Response from GET /api/auth/project/consent-info (app name, granted scopes, user). */
export interface ProjectConsentInfo {
  name: string | null;
  scopes: ProjectAppScopeInfo[];
  user: ProjectConsentInfoUser | null;
}

/** Response from POST /api/auth/project/consent/approve and /deny (redirect URL). */
export interface ProjectConsentRedirectResult {
  redirectUrl: string;
}
