import { z } from 'zod';

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: z.ZodError['errors'] = []
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validateWithSchema<T extends z.ZodSchema<any>>(
  schema: T,
  data: unknown,
  errorPrefix: string,
  context?: string
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const contextMsg = context ? ` in ${context}` : '';
      throw new ValidationError(
        `${errorPrefix}${contextMsg}: ${error.errors.map((e) => e.message).join(', ')}`,
        error.errors
      );
    }
    throw error;
  }
}

export function validateInput<T extends z.ZodSchema<any>>(
  schema: T,
  data: z.input<T>,
  context?: string
): z.infer<T> {
  return validateWithSchema(schema, data, 'Input validation failed', context);
}

export function validateOutput<T extends z.ZodSchema<any>>(
  schema: T,
  data: unknown,
  context?: string
): z.infer<T> {
  return validateWithSchema(schema, data, 'Output validation failed', context);
}

export function safeValidateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError['errors'] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    throw error;
  }
}

export function safeValidateOutput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError['errors'] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    throw error;
  }
}
