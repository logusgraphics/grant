import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { z } from '@/lib/zod-openapi.lib';
import {
  authenticationErrorResponseSchema,
  errorResponseSchema,
  loginRequestSchema,
  loginResultSchema,
  logoutRequestSchema,
  logoutResponseSchema,
  refreshSessionRequestSchema,
  refreshSessionResponseSchema,
  registerRequestSchema,
  registerResponseSchema,
  requestPasswordResetRequestSchema,
  requestPasswordResetResponseSchema,
  resetPasswordRequestSchema,
  resetPasswordResponseSchema,
  validationErrorResponseSchema,
} from '@/rest/schemas';

/**
 * Register authentication endpoints in the OpenAPI registry
 */
export function registerAuthEndpoints(registry: OpenAPIRegistry) {
  /**
   * POST /api/auth/login
   * Authenticate a user with provider credentials
   */
  registry.registerPath({
    method: 'post',
    path: '/api/auth/login',
    tags: ['Authentication'],
    summary: 'Login user',
    description:
      'Authenticate a user using provider credentials (email, Google, GitHub, Microsoft)',
    request: {
      body: {
        content: {
          'application/json': {
            schema: loginRequestSchema,
            example: {
              provider: 'email',
              providerId: 'user@example.com',
              providerData: { email_verified: true },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully authenticated',
        content: {
          'application/json': {
            schema: z.object({
              success: z.literal(true),
              data: loginResultSchema,
            }),
            example: {
              success: true,
              data: {
                account: {
                  id: 'acc_123',
                  name: 'John Doe',
                  username: 'johndoe',
                  type: 'personal',
                  createdAt: '2025-10-11T00:00:00Z',
                  updatedAt: '2025-10-11T00:00:00Z',
                },
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
            },
          },
        },
      },
      400: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: validationErrorResponseSchema,
          },
        },
      },
      401: {
        description: 'Authentication failed',
        content: {
          'application/json': {
            schema: authenticationErrorResponseSchema,
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });

  /**
   * POST /api/auth/register
   * Register a new user account
   */
  registry.registerPath({
    method: 'post',
    path: '/api/auth/register',
    tags: ['Authentication'],
    summary: 'Register new user',
    description: 'Create a new user account with provider authentication',
    request: {
      body: {
        content: {
          'application/json': {
            schema: registerRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Successfully registered',
        content: {
          'application/json': {
            schema: registerResponseSchema,
          },
        },
      },
      400: {
        description: 'Validation error or registration failed',
        content: {
          'application/json': {
            schema: validationErrorResponseSchema,
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });

  /**
   * POST /api/auth/refresh
   * Refresh authentication tokens
   */
  registry.registerPath({
    method: 'post',
    path: '/api/auth/refresh',
    tags: ['Authentication'],
    summary: 'Refresh session',
    description: 'Refresh access and refresh tokens for an authenticated session',
    request: {
      body: {
        content: {
          'application/json': {
            schema: refreshSessionRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully refreshed tokens',
        content: {
          'application/json': {
            schema: refreshSessionResponseSchema,
          },
        },
      },
      400: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: validationErrorResponseSchema,
          },
        },
      },
      401: {
        description: 'Invalid or expired tokens',
        content: {
          'application/json': {
            schema: authenticationErrorResponseSchema,
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });

  /**
   * POST /api/auth/logout
   * Logout user and invalidate session
   */
  registry.registerPath({
    method: 'post',
    path: '/api/auth/logout',
    tags: ['Authentication'],
    summary: 'Logout user',
    description: 'Logout the current user and invalidate their session',
    request: {
      body: {
        content: {
          'application/json': {
            schema: logoutRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully logged out',
        content: {
          'application/json': {
            schema: logoutResponseSchema,
          },
        },
      },
      400: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: validationErrorResponseSchema,
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });

  /**
   * POST /api/auth/request-password-reset
   * Request a password reset email
   */
  registry.registerPath({
    method: 'post',
    path: '/api/auth/request-password-reset',
    tags: ['Authentication'],
    summary: 'Request password reset',
    description: 'Request a password reset email to be sent to the specified email address',
    request: {
      body: {
        content: {
          'application/json': {
            schema: requestPasswordResetRequestSchema,
            example: {
              email: 'user@example.com',
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Password reset email sent successfully',
        content: {
          'application/json': {
            schema: requestPasswordResetResponseSchema,
          },
        },
      },
      400: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: validationErrorResponseSchema,
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });

  /**
   * POST /api/auth/reset-password
   * Reset password using token from email
   */
  registry.registerPath({
    method: 'post',
    path: '/api/auth/reset-password',
    tags: ['Authentication'],
    summary: 'Reset password',
    description: 'Reset the password for an account using a token received via email',
    request: {
      body: {
        content: {
          'application/json': {
            schema: resetPasswordRequestSchema,
            example: {
              token: 'abc123def456...',
              newPassword: 'NewSecurePassword123!',
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Password reset successfully',
        content: {
          'application/json': {
            schema: resetPasswordResponseSchema,
          },
        },
      },
      400: {
        description: 'Validation error or invalid/expired token',
        content: {
          'application/json': {
            schema: validationErrorResponseSchema,
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });
}
