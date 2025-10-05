import Cookies from 'js-cookie';
import { verify, JwtPayload } from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';

import { AccountType, Tenant } from '@/graphql/generated/types';
import { AuthenticatedUser } from '@/graphql/types';

import {
  AUTH_ACCESS_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
  REFRESH_TOKEN_EXPIRATION_DAYS,
  JWT_SECRET,
} from './constants';

interface JWTPayload {
  exp: number;
  sub: string;
  email: string;
}

export function setStoredTokens(accessToken: string, refreshToken: string): void {
  Cookies.set(AUTH_ACCESS_TOKEN_KEY, accessToken, {
    expires: REFRESH_TOKEN_EXPIRATION_DAYS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  Cookies.set(AUTH_REFRESH_TOKEN_KEY, refreshToken, {
    expires: REFRESH_TOKEN_EXPIRATION_DAYS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export function removeStoredTokens(): void {
  Cookies.remove(AUTH_ACCESS_TOKEN_KEY, { path: '/' });
  Cookies.remove(AUTH_REFRESH_TOKEN_KEY, { path: '/' });
}

export function isTokenValid(token: string): boolean {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
}

export function getRedirectPath(
  accountType: AccountType,
  accountId: string,
  locale: string
): string {
  switch (accountType) {
    case AccountType.Personal:
      return `/${locale}/dashboard/accounts/${accountId}`;
    case AccountType.Organization:
      return `/${locale}/dashboard/organizations`;
    default:
      return `/${locale}/dashboard`;
  }
}

export function extractUserFromToken(authHeader: string | null): AuthenticatedUser | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded.sub) {
      console.warn('JWT token missing required field (sub)');
      return null;
    }

    let scope;
    if (decoded.aud && typeof decoded.aud === 'string') {
      const [tenantStr, scopeId] = decoded.aud.split(':');

      let tenant: Tenant;
      switch (tenantStr) {
        case 'account':
          tenant = Tenant.Account;
          break;
        case 'organization':
          tenant = Tenant.Organization;
          break;
        case 'project':
          tenant = Tenant.Project;
          break;
        default:
          console.warn(`Unknown tenant type in JWT aud claim: ${tenantStr}`);
          return null;
      }

      if (!scopeId) {
        console.warn('JWT token aud claim missing scope ID');
        return null;
      }

      scope = {
        tenant,
        id: scopeId,
      };
    } else {
      console.warn('JWT token missing or invalid aud claim');
      return null;
    }

    return {
      id: decoded.sub,
      scope,
    };
  } catch (error) {
    console.warn(
      'JWT token verification failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return null;
  }
}
