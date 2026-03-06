/**
 * Decode JWT payload without verification (for reading scope in the example only).
 * Do not use for security-sensitive decisions.
 */

export interface ProjectAppJwtPayload {
  sub?: string;
  scope?: { tenant: string; id: string };
  scopes?: string[];
  type?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export function decodeJwtPayload(token: string): ProjectAppJwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as ProjectAppJwtPayload;
  } catch {
    return null;
  }
}
