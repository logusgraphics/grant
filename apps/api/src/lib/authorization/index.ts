export {
  authenticateGraphQLResolver,
  authenticateRestRoute,
  isAuthenticatedGraphQL,
  isAuthenticatedRest,
} from './auth-guard';
export { requireEmailThenMfaGraphQL, requireEmailThenMfaRest } from './email-then-mfa-compose';
export {
  type EmailVerificationGraphQLGuardOptions,
  requireEmailVerificationGraphQL,
} from './email-verification-graphql-guard';
export {
  type EmailVerificationRestGuardOptions,
  requireEmailVerificationRest,
} from './email-verification-rest-guard';
export { authorizeGraphQLResolver, type GraphQLGuardOptions } from './graphql-guard';
export { type MfaGraphQLGuardOptions, requireMfaGraphQL } from './mfa-graphql-guard';
export { type MfaRestGuardOptions, requireMfaRest } from './mfa-rest-guard';
export { authorizeRestRoute, type RestGuardOptions } from './rest-guard';
export { extractScopeFromRequest, extractScopeFromResolverRequest } from './scope-extractor';
export type { ResourceResolver, ResourceResolverParams, ResourceResolverResult } from './types';
