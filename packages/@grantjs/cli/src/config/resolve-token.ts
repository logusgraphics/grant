import { exchangeApiKey } from '../api/client.js';
import type { GrantConfig } from '../types/config.js';

/**
 * Resolve a valid access token from stored config.
 * Only tokens are stored (no credentials). Session auth does not auto-refresh; user must re-auth when the access token expires.
 *
 * - API key: exchanges clientId + clientSecret for a fresh token (no credentials stored after exchange).
 * - Session: returns the stored access token. When it expires, the user must run "grant start" again to re-authenticate.
 */
export async function resolveAccessToken(config: GrantConfig): Promise<string> {
  if (config.authMethod === 'api-key' && config.apiKey) {
    const { accessToken } = await exchangeApiKey(config.apiUrl, {
      clientId: config.apiKey.clientId,
      clientSecret: config.apiKey.clientSecret,
      scope: config.apiKey.scope,
    });
    return accessToken;
  }
  if (config.authMethod === 'session' && config.session?.token) {
    return config.session.token;
  }
  throw new Error('No credentials in config. Run "grant start" to set up authentication.');
}
