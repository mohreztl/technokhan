import { FastifyReply } from 'fastify';
import { ZodError, ZodSchema } from 'zod';

/**
 * Validate request data with Zod schema (throws on error)
 */
export function validateSchema<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Format Zod validation errors for API response
 */
export function formatZodError(error: ZodError): { field: string; message: string }[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

/**
 * Validation result type
 */
type ValidationResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: string; details?: { field: string; message: string }[] };

/**
 * Validate request data with Zod schema (returns result object)
 */
export function validateRequest<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof ZodError) {
      const details = formatZodError(error);
      const firstError = details[0]?.message || 'خطای اعتبارسنجی';
      return { success: false, error: firstError, details };
    }
    return { success: false, error: 'خطای داخلی' };
  }
}

/**
 * Standard API response helpers
 */
export const apiResponse = {
  success: <T>(reply: FastifyReply, data: T, statusCode = 200) => {
    return reply.status(statusCode).send({
      success: true,
      data,
    });
  },

  error: (reply: FastifyReply, error: string, statusCode = 400, code?: string, details?: unknown) => {
    const response: Record<string, unknown> = {
      success: false,
      error,
    };
    if (code) response.code = code;
    if (details) response.details = details;
    return reply.status(statusCode).send(response);
  },

  paginated: <T>(
    reply: FastifyReply,
    data: T[],
    total: number,
    page: number,
    limit: number
  ) => {
    return reply.status(200).send({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  },
};
