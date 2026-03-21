import { TokenType, Tenant } from '@grantjs/schema';
import { NextFunction, Request, Response } from 'express';

import { ContextRequest } from '@/types';

import { isAuthenticatedRest } from './auth-guard';
import { extractScopeFromRequest } from './scope-extractor';

export interface MfaRestGuardOptions {
  allowPersonalContext?: boolean;
}

export function requireMfaRest(options: MfaRestGuardOptions = {}) {
  const { allowPersonalContext = true } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    const contextReq = req as ContextRequest;
    if (!isAuthenticatedRest(req)) {
      return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHENTICATED' });
    }
    const { user, handlers } = contextReq.context;
    if (user!.type === TokenType.ApiKey || user!.type === TokenType.ProjectApp) {
      return next();
    }
    const scope = user!.scope ?? extractScopeFromRequest(req);
    if (!scope) {
      return next();
    }
    const isOrganizationScope =
      scope.tenant === Tenant.Organization ||
      scope.tenant === Tenant.OrganizationProject ||
      scope.tenant === Tenant.OrganizationProjectUser;
    if (!isOrganizationScope) {
      return next();
    }
    if (allowPersonalContext && (await handlers.auth.isPersonalScope(scope))) {
      return next();
    }

    let orgRequiresMfa = true;
    if (scope.tenant === Tenant.Organization) {
      const result = await handlers.organizations.getOrganizations({
        ids: [scope.id],
        limit: 1,
        requestedFields: ['requireMfaForSensitiveActions'],
      });
      orgRequiresMfa = Boolean(result.organizations?.[0]?.requireMfaForSensitiveActions ?? false);
    }
    const userRequiresMfa = await handlers.me.hasActiveMfaEnrollmentForUser(user!.userId);
    const requiresMfa = orgRequiresMfa || userRequiresMfa;

    if (!requiresMfa || user!.mfaVerified) {
      return next();
    }
    return res.status(403).json({ error: 'MFA required', code: 'MFA_REQUIRED' });
  };
}
