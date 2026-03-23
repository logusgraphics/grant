import type { Scope } from '@grantjs/schema';

// Re-export schema types for convenience
export type { Scope, Tenant } from '@grantjs/schema';

/**
 * Options for project-app OAuth sign-in (redirect only).
 */
export interface SignInWithProjectAppOptions {
  /** Project app client_id */
  clientId: string;
  /** Callback URL; user is redirected here with token in the URL fragment after consent */
  redirectUri: string;
  /** Optional scope (if app supports dynamic scope) */
  scope?: string;
  /** Optional state to round-trip */
  state?: string;
  /** Locale for entry URL (e.g. 'en'). Default 'en'. */
  locale?: string;
}

/**
 * Configuration for the Grant client
 */
export interface GrantClientConfig {
  /**
   * Grant API URL (e.g., "https://api.grant.com")
   */
  apiUrl: string;

  /**
   * Grant web app (frontend) URL for project OAuth entry (e.g. "https://app.grant.com").
   * Required for signInWithProjectApp. Entry URL: {frontendUrl}/{locale}/auth/project.
   */
  frontendUrl?: string;

  /**
   * Function to get the current access token
   * Return null if not authenticated
   */
  getAccessToken?: () => string | null | Promise<string | null>;

  /**
   * Callback when the access token is updated after a cookie-based refresh.
   * The API returns only `accessToken` in the refresh response body; the refresh token stays in an HttpOnly cookie.
   * Use this to update your in-memory or cookie-based access token so subsequent requests use the new token.
   */
  onTokenRefresh?: (tokens: AuthTokens) => void | Promise<void>;

  /**
   * Callback when authentication fails (after refresh attempt)
   * Use this to redirect to login
   */
  onUnauthorized?: () => void;

  /**
   * **Session refresh (cookie-based).** Called on 401 to refresh the session using the HttpOnly refresh cookie.
   * Your callback should: (1) call `POST /api/auth/refresh` with `credentials: 'include'`, (2) parse the
   * response for the new `accessToken`, (3) update your app token storage (e.g. set the new access token so
   * `getAccessToken` returns it), and optionally call the same logic you pass to `onTokenRefresh`. Return `true`
   * if refresh succeeded so the client can retry the request.
   * Refresh tokens are not sent in the request body; the API uses only the HttpOnly refresh cookie.
   */
  onRefreshWithCredentials?: () => Promise<boolean>;

  /**
   * Called when a request is rejected with MFA_REQUIRED (HTTP 403).
   * Return `true` after the user completes MFA verification so the client retries the request
   * with the updated access token, or `false` to accept the denial.
   */
  onMfaRequired?: () => Promise<boolean>;

  /**
   * Custom fetch implementation
   * Defaults to globalThis.fetch
   */
  fetch?: typeof fetch;

  /**
   * Credentials mode for fetch requests
   * Defaults to 'include' for cookie support
   */
  credentials?: RequestCredentials;

  /**
   * Cache configuration
   */
  cache?: CacheOptions;
}

/**
 * Auth tokens from the refresh endpoint. With cookie-based refresh, the API returns only `accessToken` in the
 * response body; `refreshToken` is set in an HttpOnly cookie and is not exposed to JS, so it may be undefined.
 */
export interface AuthTokens {
  accessToken: string;
  /** Undefined when using cookie-based refresh (refresh token is HttpOnly cookie). */
  refreshToken?: string;
}

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /**
   * Default TTL in milliseconds
   * @default 300000 (5 minutes)
   */
  ttl?: number;

  /**
   * Key prefix for cache entries
   * @default 'grant'
   */
  prefix?: string;
}

/**
 * Result of an authorization check
 */
export interface AuthorizationResult {
  /** Whether the action is authorized */
  authorized: boolean;
  /** Human-readable reason for the decision */
  reason?: string;
  /** The permission that matched (if authorized) */
  matchedPermission?: Permission;
}

/**
 * Options for permission queries
 */
export interface PermissionQueryOptions {
  /** Scope to check permissions in */
  scope?: Scope;
  /** Whether to use cached results (default: true) */
  useCache?: boolean;
  /** Resource to check permissions for */
  context?: {
    resource?: Record<string, unknown> | null;
  };
}

/**
 * Permission entity
 */
export interface Permission {
  id: string;
  name: string;
  description?: string | null;
  action: string;
  resourceId?: string | null;
  resource?: Resource | null;
  condition?: unknown;
}

/**
 * Resource entity
 */
export interface Resource {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  actions: string[];
}

/**
 * Error response from the API
 */
export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}
