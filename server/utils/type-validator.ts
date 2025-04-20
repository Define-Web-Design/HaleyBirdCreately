
/**
 * Runtime type validation utility
 * This helps validate data structures at runtime, complementing TypeScript's compile-time checks
 */

import { z } from 'zod';
import { logger } from './logger';

/**
 * Validate data against a Zod schema
 * @param data The data to validate
 * @param schema The Zod schema to validate against
 * @param options Options for validation
 * @returns The validated data or null if validation fails
 */
export function validateData<T>(
  data: unknown, 
  schema: z.ZodType<T>,
  options: {
    logErrors?: boolean;
    errorPrefix?: string;
  } = { logErrors: true, errorPrefix: 'Validation error' }
): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    if (options.logErrors) {
      logger.error(`${options.errorPrefix || 'Validation error'}: ${error.message}`);
      
      // If it's a Zod error, log the issues
      if (error instanceof z.ZodError) {
        error.errors.forEach(issue => {
          logger.error(`- Path: ${issue.path.join('.')}, Error: ${issue.message}`);
        });
      }
    }
    return null;
  }
}

/**
 * Safe parse data against a Zod schema
 * @param data The data to validate 
 * @param schema The Zod schema to validate against
 * @returns Object with success flag and either data or error
 */
export function safeValidate<T>(
  data: unknown,
  schema: z.ZodType<T>
) {
  return schema.safeParse(data);
}

/**
 * Creates a validated API endpoint handler
 * @param inputSchema Schema for request body/params
 * @param handler The handler function
 */
export function createValidatedHandler<T>(
  inputSchema: z.ZodType<T>,
  handler: (data: T, req: any, res: any, next: any) => Promise<any> | any
) {
  return async (req: any, res: any, next: any) => {
    const validationResult = inputSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: validationResult.error.errors
      });
    }
    
    try {
      return await handler(validationResult.data, req, res, next);
    } catch (error) {
      logger.error('Handler error:', error);
      next(error);
    }
  };
}
