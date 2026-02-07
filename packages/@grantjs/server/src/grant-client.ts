import { extractTokenFromRequest } from './utils/token-extractor';

import type { GrantServerConfig, AuthorizationResult, PermissionCheckOptions } from './types';

/**
 * Grant Client for server-side applications
 *
 * Makes HTTP requests to the Grant API to check permissions.
 * Uses API-key exchanged tokens (scope in JWT claims); token-based and cookie-based extraction supported.
 * No caching - server-side caching is handled by grant-api.
 */
export class GrantClient {
  public readonly config: Required<Pick<GrantServerConfig, 'apiUrl'>> & GrantServerConfig;

  constructor(config: GrantServerConfig) {
    this.config = config;
  }

  // ============================================================================
  // Public API - Permission Checks
  // ============================================================================

  /**
   * Check if the current user has a specific permission
   *
   * @example
   * ```ts
   * const canEdit = await grant.isGranted('document', 'update', { scope });
   * if (canEdit) {
   *   // Proceed with operation
   * }
   * ```
   */
  async isGranted(
    resource: string,
    action: string,
    options?: PermissionCheckOptions,
    request?: unknown
  ): Promise<boolean> {
    const result = await this.isAuthorized(resource, action, options, request);
    return result.authorized;
  }

  /**
   * Check authorization with full result details
   *
   * @example
   * ```ts
   * const result = await grant.isAuthorized('document', 'update', { scope }, request);
   * if (!result.authorized) {
   *   console.log('Denied:', result.reason);
   * }
   * ```
   */
  async isAuthorized(
    resource: string,
    action: string,
    options?: PermissionCheckOptions,
    request?: unknown
  ): Promise<AuthorizationResult> {
    try {
      // API expects: { permission: { resource, action }, context: { resource?: any }, scope?: { tenant, id } }
      const response = await this.fetchWithAuth(
        '/api/auth/is-authorized',
        {
          method: 'POST',
          body: JSON.stringify({
            permission: {
              resource,
              action,
            },
            context: {
              resource: options?.context?.resource || null,
            },
          }),
        },
        request
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          authorized: false,
          reason: error.message || `API error: ${response.status}`,
        };
      }

      const json = await response.json();
      // API returns { success: true, data: { authorized, ... } }
      const result: AuthorizationResult = json.data ?? json;
      return result;
    } catch (error) {
      return {
        authorized: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Extract token from a request object
   * Useful for middleware that needs to extract token before making authorization calls
   */
  async getTokenFromRequest(request: unknown): Promise<string | null> {
    return extractTokenFromRequest(request, this.config);
  }

  // ============================================================================
  // Private - HTTP & Authentication
  // ============================================================================

  /**
   * Make an authenticated fetch request (token from request; no refresh).
   */
  private async fetchWithAuth(
    url: string,
    init?: RequestInit,
    request?: unknown
  ): Promise<Response> {
    return this.doFetch(url, init, request);
  }

  /**
   * Perform the actual fetch request
   */
  private async doFetch(url: string, init?: RequestInit, request?: unknown): Promise<Response> {
    const fetchFn = this.config.fetch ?? globalThis.fetch;
    const fullUrl = url.startsWith('http') ? url : `${this.config.apiUrl}${url}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string>),
    };

    // Add authorization header if token is available
    if (request) {
      const token = await extractTokenFromRequest(request, this.config);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Forward cookies if using cookie-based auth
      const req = request as { headers?: { cookie?: string } };
      if (req.headers?.cookie) {
        headers['Cookie'] = req.headers.cookie;
      }
    }

    return fetchFn(fullUrl, {
      ...init,
      headers,
      // Include cookies for same-origin requests (supports cookie-based auth)
      credentials: this.config.credentials ?? 'include',
    });
  }
}
