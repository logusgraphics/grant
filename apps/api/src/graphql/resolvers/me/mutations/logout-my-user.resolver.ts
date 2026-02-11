import { MutationResolvers } from '@grantjs/schema';

import { GraphqlContext } from '@/graphql/types';
import { getRefreshTokenFromCookie } from '@/lib/headers.lib';
import { clearRefreshTokenCookie } from '@/rest/utils/refresh-cookie';

/**
 * Cookie-based logout only. Revokes session by refresh token from cookie and clears cookie.
 * No auth required; single logout endpoint for the app.
 */
export const logoutMyUserResolver: MutationResolvers<GraphqlContext>['logoutMyUser'] = async (
  _parent,
  _args,
  context: GraphqlContext
) => {
  const refreshTokenFromCookie = getRefreshTokenFromCookie(context.req);
  if (refreshTokenFromCookie) {
    await context.handlers.auth.logout(refreshTokenFromCookie);
  }
  clearRefreshTokenCookie(context.res);
  return {
    message: 'Logged out successfully',
  };
};
