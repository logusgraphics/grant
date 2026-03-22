import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { GrantConfig } from '../types/config.js';
import { resolveAccessToken } from './resolve-token.js';

vi.mock('../api/client.js', () => ({
  exchangeApiKey: vi.fn(),
}));

const { exchangeApiKey } = await import('../api/client.js');

describe('resolveAccessToken', () => {
  beforeEach(() => {
    vi.mocked(exchangeApiKey).mockReset();
  });

  it('returns session token when authMethod is session', async () => {
    const config: GrantConfig = {
      apiUrl: 'http://localhost',
      authMethod: 'session',
      session: { token: 'session-token-xyz' },
    };
    const token = await resolveAccessToken(config);
    expect(token).toBe('session-token-xyz');
    expect(exchangeApiKey).not.toHaveBeenCalled();
  });

  it('returns session token when authMethod is session with refreshToken stored (no auto-refresh)', async () => {
    const config: GrantConfig = {
      apiUrl: 'http://localhost',
      authMethod: 'session',
      session: { token: 'stored-access-token', refreshToken: 'stored-refresh' },
    };
    const token = await resolveAccessToken(config);
    expect(token).toBe('stored-access-token');
    expect(exchangeApiKey).not.toHaveBeenCalled();
  });

  it('calls exchangeApiKey and returns access token when authMethod is api-key', async () => {
    vi.mocked(exchangeApiKey).mockResolvedValue({
      accessToken: 'exchanged-token',
      expiresIn: 900,
    });
    const config: GrantConfig = {
      apiUrl: 'http://localhost:4000',
      authMethod: 'api-key',
      apiKey: {
        clientId: 'cid',
        clientSecret: 'secret32charsminimumrequired!!',
        scope: { tenant: 'accountProject', id: 'a:b' },
      },
    };
    const token = await resolveAccessToken(config);
    expect(token).toBe('exchanged-token');
    expect(exchangeApiKey).toHaveBeenCalledWith('http://localhost:4000', {
      clientId: 'cid',
      clientSecret: 'secret32charsminimumrequired!!',
      scope: { tenant: 'accountProject', id: 'a:b' },
    });
  });

  it('throws when no credentials (api-key but no apiKey)', async () => {
    const config: GrantConfig = {
      apiUrl: 'http://localhost',
      authMethod: 'api-key',
    };
    await expect(resolveAccessToken(config)).rejects.toThrow(
      'No credentials in config. Run "grant start" to set up authentication.'
    );
  });

  it('throws when session auth but no session token', async () => {
    const config: GrantConfig = {
      apiUrl: 'http://localhost',
      authMethod: 'session',
    };
    await expect(resolveAccessToken(config)).rejects.toThrow(
      'No credentials in config. Run "grant start" to set up authentication.'
    );
  });
});
