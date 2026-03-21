import { Resolver } from '@grantjs/schema';
import { Request, Response, NextFunction } from 'express';

import { GraphqlContext } from '@/graphql/types';

import {
  requireEmailVerificationGraphQL,
  type EmailVerificationGraphQLGuardOptions,
} from './email-verification-graphql-guard';
import {
  requireEmailVerificationRest,
  type EmailVerificationRestGuardOptions,
} from './email-verification-rest-guard';
import { requireMfaGraphQL, type MfaGraphQLGuardOptions } from './mfa-graphql-guard';
import { requireMfaRest, type MfaRestGuardOptions } from './mfa-rest-guard';

/**
 * Canonical order for sensitive scoped operations: **email verification → MFA → inner resolver** (RBAC wraps the inner resolver).
 * Use this helper so MFA is never dropped when decoupled from `requireEmailVerification*` alone.
 */
export function requireEmailThenMfaGraphQL<
  TResult,
  TParent = Record<PropertyKey, never>,
  TContext = GraphqlContext,
  TArgs = unknown,
>(
  emailOptions: EmailVerificationGraphQLGuardOptions,
  mfaOptions: MfaGraphQLGuardOptions,
  resolver: Resolver<TResult, TParent, TContext, TArgs>
): Resolver<TResult, TParent, TContext, TArgs> {
  return requireEmailVerificationGraphQL(emailOptions, requireMfaGraphQL(mfaOptions, resolver));
}

/**
 * Express middleware: runs `requireEmailVerificationRest` then `requireMfaRest` in order.
 * Place before `authorizeRestRoute` for mutating routes that need both gates.
 */
export function requireEmailThenMfaRest(
  emailOptions: EmailVerificationRestGuardOptions = {},
  mfaOptions: MfaRestGuardOptions = {}
) {
  const emailGuard = requireEmailVerificationRest(emailOptions);
  const mfaGuard = requireMfaRest(mfaOptions);

  return (req: Request, res: Response, next: NextFunction) => {
    emailGuard(req, res, (emailErr) => {
      if (emailErr) {
        return next(emailErr);
      }
      return mfaGuard(req, res, next);
    });
  };
}
