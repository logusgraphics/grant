import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';

/**
 * Validation target - where to extract data from the request
 */
export type ValidationType = 'body' | 'query' | 'params' | 'all';

/**
 * Validation schemas for different parts of the request
 */
export interface ValidationSchemas {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}

/**
 * Format Zod validation errors into a user-friendly structure
 */
function formatZodError(error: ZodError) {
  const errors = error.issues.map((err: any) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  return {
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: errors,
  };
}

/**
 * Middleware factory for validating request data with Zod schemas
 *
 * @example
 * // Validate body only
 * router.post('/users', validate({ body: createUserSchema }), handler);
 *
 * @example
 * // Validate multiple parts
 * router.put('/users/:id', validate({
 *   params: z.object({ id: z.string() }),
 *   body: updateUserSchema
 * }), handler);
 *
 * @example
 * // Validate query parameters
 * router.get('/users', validate({ query: getUsersQuerySchema }), handler);
 */
export function validate(schemas: ValidationSchemas) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body if schema provided
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      // Validate query parameters if schema provided
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as any;
      }

      // Validate URL parameters if schema provided
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as any;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodError(error));
      }

      // Handle unexpected errors
      return res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}

/**
 * Simpler validation middleware for body-only validation
 *
 * @example
 * router.post('/users', validateBody(createUserSchema), handler);
 */
export function validateBody(schema: z.ZodSchema) {
  return validate({ body: schema });
}

/**
 * Simpler validation middleware for query-only validation
 *
 * @example
 * router.get('/users', validateQuery(getUsersQuerySchema), handler);
 */
export function validateQuery(schema: z.ZodSchema) {
  return validate({ query: schema });
}

/**
 * Simpler validation middleware for params-only validation
 *
 * @example
 * router.get('/users/:id', validateParams(idParamsSchema), handler);
 */
export function validateParams(schema: z.ZodSchema) {
  return validate({ params: schema });
}
