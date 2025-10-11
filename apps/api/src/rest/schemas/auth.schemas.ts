import { UserAuthenticationMethodProvider } from '@logusgraphics/grant-schema';

import { z } from '@/lib/zod-openapi.lib';
import { accountSchema, accountTypeSchema } from '@/rest/schemas/accounts.schemas';
import { createSuccessResponseSchema } from '@/rest/schemas/common.schemas';

export const userAuthenticationMethodProviderSchema = z.enum(
  Object.values(UserAuthenticationMethodProvider) as [
    UserAuthenticationMethodProvider,
    ...UserAuthenticationMethodProvider[],
  ]
);

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const loginResultSchema = z.object({
  account: accountSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const loginRequestSchema = z.object({
  provider: userAuthenticationMethodProviderSchema,
  providerId: z.string().min(1, 'Provider ID is required'),
  providerData: z.record(z.string(), z.unknown()),
});

export const loginResponseSchema = createSuccessResponseSchema(
  loginResultSchema,
  'Successfully authenticated user'
);

export const registerResultSchema = loginResultSchema;

export const registerRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  username: z.string().optional(),
  type: accountTypeSchema,
  provider: userAuthenticationMethodProviderSchema,
  providerId: z.string().min(1, 'Provider ID is required'),
  providerData: z.record(z.string(), z.unknown()),
});

export const registerResponseSchema = createSuccessResponseSchema(
  registerResultSchema,
  'Successfully registered new user'
);

export const refreshSessionRequestSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const refreshSessionResponseSchema = createSuccessResponseSchema(
  authTokensSchema,
  'Successfully refreshed session tokens'
);

export const logoutRequestSchema = z.object({
  sessionId: z.string().optional(),
});

export const logoutResultSchema = z.object({
  message: z.string(),
});

export const logoutResponseSchema = createSuccessResponseSchema(
  logoutResultSchema,
  'Successfully logged out'
);
