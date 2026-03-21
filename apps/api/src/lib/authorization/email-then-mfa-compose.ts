import { Resolver } from '@grantjs/schema';
import { NextFunction, Request, Response } from 'express';

import { GraphqlContext } from '@/graphql/types';

import {
  type EmailVerificationGraphQLGuardOptions,
  requireEmailVerificationGraphQL,
} from './email-verification-graphql-guard';
import {
  type EmailVerificationRestGuardOptions,
  requireEmailVerificationRest,
} from './email-verification-rest-guard';
import { type MfaGraphQLGuardOptions, requireMfaGraphQL } from './mfa-graphql-guard';
import { type MfaRestGuardOptions, requireMfaRest } from './mfa-rest-guard';

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
