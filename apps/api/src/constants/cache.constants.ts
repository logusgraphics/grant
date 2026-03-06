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

/** Prefix for cached authorization results. Key: auth:result:{userId}:{scope}:{resource}:{action}:{contextHash}, or for project-app tokens with grantedScopes: auth:result:{userId}:{scope}:{grantedScopesSignature}:{resource}:{action}:{contextHash} */
export const AUTH_RESULT_CACHE_KEY_PREFIX = 'auth:result:';

// ----- OAuth namespace -----

/** Prefix for CLI OAuth callback one-time codes. Full key: oauth:cli-callback:{code} */
export const OAUTH_CLI_CALLBACK_KEY_PREFIX = 'oauth:cli-callback:';

/** Prefix for OAuth state tokens. Full key: oauth:state:{stateToken} */
export const OAUTH_STATE_KEY_PREFIX = 'oauth:state:';

/** Prefix for project OAuth flow state. Full key: oauth:project-state:{stateId} */
export const PROJECT_OAUTH_STATE_KEY_PREFIX = 'oauth:project-state:';

/** TTL in seconds for project OAuth state token (e.g. 10 min). */
export const PROJECT_OAUTH_STATE_TTL_SECONDS = 600;

/** Prefix for project OAuth email magic-link one-time tokens. Full key: oauth:project-email-token:{token} */
export const PROJECT_OAUTH_EMAIL_TOKEN_KEY_PREFIX = 'oauth:project-email-token:';

/** TTL in seconds for project OAuth email magic-link tokens (e.g. 10 min). */
export const PROJECT_OAUTH_EMAIL_TOKEN_TTL_SECONDS = 600;

/** Prefix for project OAuth consent token (post-auth consent screen). Full key: oauth:project-consent:{consentToken} */
export const PROJECT_OAUTH_CONSENT_KEY_PREFIX = 'oauth:project-consent:';

/** TTL in seconds for project OAuth consent token (e.g. 10 min). */
export const PROJECT_OAUTH_CONSENT_TTL_SECONDS = 600;
