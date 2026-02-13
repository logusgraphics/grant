import { GrantAuth } from '@grantjs/core';
import { Scope, Tenant, TokenType } from '@grantjs/schema';

import { config } from '@/config';

/** Scope used for system-level operations (e.g. session signing key). */
export const SYSTEM_SCOPE: Scope = {
  tenant: Tenant.System,
  id: config.system.systemUserId,
};

/** GrantAuth for internal operations when no user is authenticated (e.g. signing key service). */
export const SYSTEM_USER: GrantAuth = {
  userId: config.system.systemUserId,
  expiresAt: Infinity,
  type: TokenType.System,
  tokenId: 'system-token', // TODO: Generate a random token ID for the system user
  scope: SYSTEM_SCOPE,
};
