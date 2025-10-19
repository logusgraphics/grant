import { Response } from 'express';

import { Handlers } from '@/handlers';
import { ApiError } from '@/lib/errors';
import { AuthenticatedUser } from '@/types/auth';
import { RequestContext } from '@/types/context';

export abstract class BaseController {
  protected context: RequestContext;
  protected handlers: Handlers;
  protected user: AuthenticatedUser | null;
  protected origin: string;

  constructor(context: RequestContext) {
    this.context = context;
    this.handlers = context.handlers;
    this.user = context.user;
    this.origin = context.origin;
  }

  protected handleError(
    res: Response,
    error: any,
    contextOrStatusCode: string | number = 'unknown',
    statusCodeOverride?: number
  ) {
    const context = typeof contextOrStatusCode === 'string' ? contextOrStatusCode : 'unknown';

    console.error(`REST Controller Error (${context}):`, error);

    // Handle ApiError instances with proper status codes and error codes
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        error: error.message,
        code: error.code,
        ...(error.extensions && { extensions: error.extensions }),
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
        }),
      });
    }

    // Fallback for other errors
    const statusCode =
      statusCodeOverride ||
      (typeof contextOrStatusCode === 'number' ? contextOrStatusCode : error.statusCode || 500);

    res.status(statusCode).json({
      error: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error,
      }),
    });
  }

  protected ok(res: Response, data: object) {
    res.status(200).json({
      success: true,
      data,
    });
  }

  protected created(res: Response, data: object) {
    res.status(201).json({
      success: true,
      data,
    });
  }

  protected success(res: Response, data: object, statusCode: number = 200) {
    res.status(statusCode).json({
      success: true,
      data,
    });
  }
}
