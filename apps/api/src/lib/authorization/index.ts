export { extractScopeFromRequest, extractScopeFromResolverRequest } from './scope-extractor';
export {
  authenticateRestRoute,
  authenticateGraphQLResolver,
  isAuthenticatedRest,
  isAuthenticatedGraphQL,
} from './auth-guard';
export { authorizeRestRoute, type RestGuardOptions } from './rest-guard';
export { authorizeGraphQLResolver, type GraphQLGuardOptions } from './graphql-guard';
export {
  requireEmailVerificationRest,
  type EmailVerificationRestGuardOptions,
} from './email-verification-rest-guard';
export {
  requireEmailVerificationGraphQL,
  type EmailVerificationGraphQLGuardOptions,
} from './email-verification-graphql-guard';
export { requireEmailThenMfaGraphQL, requireEmailThenMfaRest } from './email-then-mfa-compose';
export { requireMfaRest, type MfaRestGuardOptions } from './mfa-rest-guard';
export { requireMfaGraphQL, type MfaGraphQLGuardOptions } from './mfa-graphql-guard';
export type { ResourceResolver, ResourceResolverParams, ResourceResolverResult } from './types';
