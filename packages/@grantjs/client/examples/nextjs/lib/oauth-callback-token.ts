/**
 * In-memory store for the access token received on the OAuth callback page.
 * The Grant client's getAccessToken reads from here so useGrant/GrantGate
 * on the callback page use the token from the completed OAuth flow.
 * Cleared when leaving the callback page so the token is only used there.
 */

let oauthCallbackToken: string | null = null;

export function setOAuthCallbackToken(token: string | null): void {
  oauthCallbackToken = token;
}

export function getOAuthCallbackToken(): string | null {
  return oauthCallbackToken;
}
