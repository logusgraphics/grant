/**
 * Platform path constants and helpers.
 * Used by frontends and API for path-based routing (gateway contract).
 * No hostnames or ports — relative paths only.
 */

export const API_PREFIX = '/api';
export const GRAPHQL_PATH = '/graphql';
export const OAUTH_PREFIX = '/oauth';
export const WELL_KNOWN_PREFIX = '/.well-known';
export const DOCS_PREFIX = '/docs';
export const EXAMPLE_PREFIX = '/example';

/**
 * Build an API path. Path should start with `/` (e.g. `/users`, `/projects`).
 */
export function apiPath(path: string): string {
  return `${API_PREFIX}${path.startsWith('/') ? path : `/${path}`}`;
}
