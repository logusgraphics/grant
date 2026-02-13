/**
 * Centralized cache key and key-prefix constants.
 * Used with IEntityCacheAdapter (signingKeys, permissions, oauth, etc.) so keys are consistent and discoverable.
 */

// ----- Signing keys namespace -----

/** Cache key for the current system (session) signing key. Invalidated on rotation. */
export const SYSTEM_SIGNING_KEY_CACHE_KEY = 'system:current';

/** Cache key prefix for verification (public key by kid). TTL only; no invalidation on rotation. */
export const VERIFICATION_KEY_CACHE_PREFIX = 'verification:';

// ----- Auth (permissions namespace: authorization result cache) -----

/** Prefix for cached authorization results. Full key: auth:result:{userId}:{scope.tenant}:{scope.id}:{resource}:{action}:{contextHash} */
export const AUTH_RESULT_CACHE_KEY_PREFIX = 'auth:result:';

// ----- OAuth namespace -----

/** Prefix for CLI OAuth callback one-time codes. Full key: oauth:cli-callback:{code} */
export const OAUTH_CLI_CALLBACK_KEY_PREFIX = 'oauth:cli-callback:';

/** Prefix for OAuth state tokens. Full key: oauth:state:{stateToken} */
export const OAUTH_STATE_KEY_PREFIX = 'oauth:state:';
