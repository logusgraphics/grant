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
  provider: userAuthenticationMethodProviderSchema.openapi({
    description: 'Authentication provider type',
    example: 'email',
  }),
  providerId: z.string().min(1, 'Provider ID is required').openapi({
    description: 'Unique identifier for the provider (email address, OAuth ID, etc.)',
    example: 'user@example.com',
  }),
  providerData: z.record(z.string(), z.unknown()).openapi({
    description: 'Additional provider-specific data',
    example: { email_verified: true },
  }),
});

export const loginResponseSchema = createSuccessResponseSchema(
  loginResultSchema,
  'Successfully authenticated user'
);

export const registerResultSchema = loginResultSchema;

export const registerRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').openapi({
    description: "User's full name",
    example: 'John Doe',
  }),
  username: z.string().optional().openapi({
    description: 'Unique username (optional, auto-generated if not provided)',
    example: 'johndoe',
  }),
  type: accountTypeSchema.openapi({
    description: 'Account type',
    example: 'personal',
  }),
  provider: userAuthenticationMethodProviderSchema.openapi({
    description: 'Authentication provider type',
    example: 'email',
  }),
  providerId: z.string().min(1, 'Provider ID is required').openapi({
    description: 'Unique identifier for the provider (email address, OAuth ID, etc.)',
    example: 'user@example.com',
  }),
  providerData: z.record(z.string(), z.unknown()).openapi({
    description: 'Additional provider-specific data',
    example: { email_verified: true, password: 'hashedPassword' },
  }),
});

export const registerResponseSchema = createSuccessResponseSchema(
  registerResultSchema,
  'Successfully registered new user'
);

export const refreshSessionRequestSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required').openapi({
    description: 'Current access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  }),
  refreshToken: z.string().min(1, 'Refresh token is required').openapi({
    description: 'Refresh token to obtain a new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  }),
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
